const cron                    = require("node-cron");
const { ShoppingCardSchema }  = require("./models_import");
const { sendTemplateMessage } = require("./whatsapp.controller");
const { cartAbandonmentMail } = require("../mail/sendMail");

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const IS_PRODUCTION = process.env.NODE_ENV === "production";

// How long a cart must be idle before the FIRST reminder
const ABANDON_THRESHOLD_MS = IS_PRODUCTION
  ? 60 * 60 * 1000   // PRODUCTION : 1 hour
  : 2  * 60 * 1000;  // DEVELOPMENT: 2 minutes (easy to test)

// How long to wait between REPEATED reminders
const REMIND_INTERVAL_MS = IS_PRODUCTION
  ? 60 * 60 * 1000   // PRODUCTION : re-remind every 1 hour
  : 2  * 60 * 1000;  // DEVELOPMENT: re-remind every 2 minutes

// Maximum number of reminders per cart (prevents spamming forever)
const MAX_REMINDERS = IS_PRODUCTION ? 3 : 5;

// Delete carts that have received MAX_REMINDERS after this long
const DELETE_AFTER_MAX_REMINDERS_MS = 24 * 60 * 60 * 1000; // 24 hours

// Cron schedules
const REMINDER_CRON = IS_PRODUCTION ? "0 * * * *"    : "*/2 * * * *";
const CLEANUP_CRON  = "0 */6 * * *";

const TIMEZONE = process.env.TZ || "Asia/Kolkata";

// ─────────────────────────────────────────────────────────────────────────────
// Overlap guards — prevent a slow job from running twice simultaneously
// ─────────────────────────────────────────────────────────────────────────────

let reminderJobRunning = false;
let cleanupJobRunning  = false;

// ─────────────────────────────────────────────────────────────────────────────
// WhatsApp helper
// ─────────────────────────────────────────────────────────────────────────────

const sendAbandonmentWhatsApp = async (phone, cartItems, reminderCount) => {
  if (!phone || !cartItems?.length) throw new Error("Missing phone or cartItems");

  const topItem    = cartItems[0];
  const extraItems = Math.max(0, cartItems.length - 1);

  const templateName = process.env.CART_REMINDER_TEMPLATE || "cart_abandonment_reminder";
  const cartUrl      = `${process.env.FRONTEND_URL || "https://printe.in"}/shopping-cart`;

  const result = await sendTemplateMessage(phone, templateName, "en", {
    field_1: topItem?.product_name || "your items",
    field_2: extraItems.toString(),
    field_3: cartUrl,
  });

  if (result && result.status === "error") {
    throw new Error(result.message || "Digitell returned an error status");
  }

  console.log(
    `[AbandonCart] ✅ WhatsApp sent → ${phone} | reminder #${reminderCount + 1}` +
    ` | "${topItem?.product_name}" + ${extraItems} more`
  );
  return true;
};

// ─────────────────────────────────────────────────────────────────────────────
// Group flat cart items by owner
// Returns: [{ user_id, guest_id, phone, email, reminder_count, items }]
// ─────────────────────────────────────────────────────────────────────────────

const groupCartsByOwner = (items) => {
  const map = new Map();

  for (const item of items) {
    const key = item.user_id
      ? `user_${item.user_id}`
      : `guest_${item.guest_id}`;

    if (!map.has(key)) {
      map.set(key, {
        user_id:        item.user_id  || null,
        guest_id:       item.guest_id || null,
        phone:          item.phone_number || null,
        email:          item.email        || null,
        reminder_count: item.reminder_count || 0,
        items:          [],
      });
    }

    const group = map.get(key);
    if (!group.phone && item.phone_number) group.phone = item.phone_number;
    if (!group.email && item.email)        group.email = item.email;

    // Use the highest reminder_count seen across the group's items
    if ((item.reminder_count || 0) > group.reminder_count) {
      group.reminder_count = item.reminder_count;
    }

    group.items.push(item);
  }

  return Array.from(map.values());
};

// ─────────────────────────────────────────────────────────────────────────────
// Update reminder tracking in DB after a successful send
//
// Uses CRON_INTERNAL_UPDATE: true so the pre-update hook does NOT
// touch updated_at — keeping the customer's abandon clock intact.
// ─────────────────────────────────────────────────────────────────────────────

const recordReminderSent = async (items, ownerId, newCount) => {
  const ids = items.map((i) => i._id);

  const result = await ShoppingCardSchema.updateMany(
    { _id: { $in: ids } },
    {
      $set: {
        reminder_count:        newCount,
        last_reminder_sent_at: new Date(),
        // ✅ updated_at is intentionally NOT set here — hook is skipped via flag
      },
    },
    { CRON_INTERNAL_UPDATE: true }  // skips the pre-updateMany updated_at hook
  );

  console.log(
    `[AbandonCart] 📝 Recorded reminder #${newCount} for ${result.modifiedCount}` +
    `/${ids.length} item(s) — owner: ${ownerId}`
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Debug stats — logged on every tick so you can see exactly what's happening
// ─────────────────────────────────────────────────────────────────────────────

const logDebugStats = async (abandonCutoff, reminderCutoff) => {
  const [total, maxed, tooRecent, notDueYet, eligible] = await Promise.all([
    ShoppingCardSchema.countDocuments({}),
    ShoppingCardSchema.countDocuments({ reminder_count: { $gte: MAX_REMINDERS } }),
    ShoppingCardSchema.countDocuments({ updated_at: { $gte: abandonCutoff } }),
    ShoppingCardSchema.countDocuments({
      updated_at:            { $lt: abandonCutoff },
      reminder_count:        { $lt: MAX_REMINDERS },
      last_reminder_sent_at: { $gte: reminderCutoff },
    }),
    ShoppingCardSchema.countDocuments({
      updated_at:     { $lt: abandonCutoff },
      reminder_count: { $lt: MAX_REMINDERS },
      $or: [
        { last_reminder_sent_at: null },
        { last_reminder_sent_at: { $lt: reminderCutoff } },
      ],
    }),
  ]);

  console.log(
    `[AbandonCart] 🔍 Stats — Total: ${total}` +
    ` | Max reminders reached: ${maxed}` +
    ` | Too recent (not abandoned yet): ${tooRecent}` +
    ` | Not due yet (interval not elapsed): ${notDueYet}` +
    ` | ✅ Eligible this tick: ${eligible}` +
    ` | Abandon cutoff: ${abandonCutoff.toISOString()}` +
    ` | Reminder interval cutoff: ${reminderCutoff.toISOString()}`
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main abandonment reminder job
// ─────────────────────────────────────────────────────────────────────────────

const runCartAbandonmentJob = async () => {
  if (reminderJobRunning) {
    console.warn("[AbandonCart] ⚠ Previous run still active — skipping tick.");
    return;
  }
  reminderJobRunning = true;

  console.log("[AbandonCart] ▶ Reminder job started:", new Date().toISOString());

  try {
    // Cart must have been idle for at least ABANDON_THRESHOLD_MS
    const abandonCutoff  = new Date(Date.now() - ABANDON_THRESHOLD_MS);

    // The last reminder must have been sent at least REMIND_INTERVAL_MS ago
    const reminderCutoff = new Date(Date.now() - REMIND_INTERVAL_MS);

    await logDebugStats(abandonCutoff, reminderCutoff);

    // ── Query: eligible carts for this tick ───────────────────────────────
    //
    // A cart is eligible when ALL of the following are true:
    //   1. updated_at < abandonCutoff        — cart has been idle long enough
    //   2. reminder_count < MAX_REMINDERS    — hasn't hit the reminder cap
    //   3. last_reminder_sent_at is null     — first reminder ever
    //      OR last_reminder_sent_at < reminderCutoff  — interval has elapsed
    //
    const abandonedItems = await ShoppingCardSchema.find({
      updated_at:     { $lt: abandonCutoff },
      reminder_count: { $lt: MAX_REMINDERS },
      $or: [
        { last_reminder_sent_at: null },
        { last_reminder_sent_at: { $lt: reminderCutoff } },
      ],
    }).lean();

    if (!abandonedItems.length) {
      console.log("[AbandonCart] ✅ No eligible carts this tick.");
      return;
    }

    console.log(`[AbandonCart] 🛒 ${abandonedItems.length} item(s) across eligible carts.`);

    const groups = groupCartsByOwner(abandonedItems);
    console.log(`[AbandonCart] 👥 ${groups.length} owner(s) to notify.`);

    let whatsappSent = 0;
    let emailSent    = 0;
    let skipped      = 0;
    let failed       = 0;

    for (const group of groups) {
      const ownerId     = group.user_id || group.guest_id || "unknown";
      const { phone, email, reminder_count } = group;
      const nextCount   = reminder_count + 1;

      try {
        if (!phone && !email) {
          console.warn(`[AbandonCart] ⚠ No contact info — owner: ${ownerId}`);
          skipped++;
          continue;
        }

        let notified = false;

        // ── WhatsApp first ────────────────────────────────────────────────
        if (phone) {
          try {
            await sendAbandonmentWhatsApp(phone, group.items, reminder_count);
            notified = true;
            whatsappSent++;
          } catch (waErr) {
            console.error(`[AbandonCart] ❌ WhatsApp failed (${phone}): ${waErr.message}`);

            // Fallback to email
            if (email) {
              try {
                await cartAbandonmentMail(email, group.items);
                notified = true;
                emailSent++;
                console.log(`[AbandonCart] ✅ Fallback email → ${email}`);
              } catch (mailErr) {
                console.error(`[AbandonCart] ❌ Email fallback failed (${email}): ${mailErr.message}`);
                failed++;
              }
            } else {
              failed++;
            }
          }

        // ── Email only ────────────────────────────────────────────────────
        } else if (email) {
          try {
            await cartAbandonmentMail(email, group.items);
            notified = true;
            emailSent++;
            console.log(`[AbandonCart] ✅ Email → ${email}`);
          } catch (mailErr) {
            console.error(`[AbandonCart] ❌ Email failed (${email}): ${mailErr.message}`);
            failed++;
          }
        }

        if (notified) {
          await recordReminderSent(group.items, ownerId, nextCount);
        }

      } catch (innerErr) {
        console.error(`[AbandonCart] ❌ Unexpected error — owner ${ownerId}: ${innerErr.message}`);
        failed++;
      }
    }

    console.log(
      `[AbandonCart] 📊 Summary — WhatsApp: ${whatsappSent}` +
      ` | Email: ${emailSent} | Skipped: ${skipped} | Failed: ${failed}`
    );

  } catch (err) {
    console.error("[AbandonCart] ❌ Fatal job error:", err);
  } finally {
    reminderJobRunning = false;
    console.log("[AbandonCart] ■ Reminder job finished:", new Date().toISOString());
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Cleanup job — deletes carts that have hit MAX_REMINDERS and are 24h old
// ─────────────────────────────────────────────────────────────────────────────

const runCartCleanupJob = async () => {
  if (cleanupJobRunning) {
    console.warn("[AbandonCart] ⚠ Cleanup already running — skipping.");
    return;
  }
  cleanupJobRunning = true;

  console.log("[AbandonCart] ▶ Cleanup started:", new Date().toISOString());

  try {
    const cutoff = new Date(Date.now() - DELETE_AFTER_MAX_REMINDERS_MS);

    const result = await ShoppingCardSchema.deleteMany({
      reminder_count:        { $gte: MAX_REMINDERS },
      last_reminder_sent_at: { $lt: cutoff },
    });

    if (result.deletedCount > 0) {
      console.log(`[AbandonCart] 🗑 Deleted ${result.deletedCount} stale cart(s).`);
    } else {
      console.log("[AbandonCart] ✅ Nothing to clean up.");
    }
  } catch (err) {
    console.error("[AbandonCart] ❌ Cleanup error:", err);
  } finally {
    cleanupJobRunning = false;
    console.log("[AbandonCart] ■ Cleanup finished:", new Date().toISOString());
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Start cron jobs
// Call after mongoose.connect() resolves in server.js
// ─────────────────────────────────────────────────────────────────────────────

const startCartReminderCron = () => {
  cron.schedule(REMINDER_CRON, runCartAbandonmentJob, { scheduled: true, timezone: TIMEZONE });
  cron.schedule(CLEANUP_CRON,  runCartCleanupJob,     { scheduled: true, timezone: TIMEZONE });

  console.log(
    `[AbandonCart] ✅ Cron ready` +
    ` | Reminder: "${REMINDER_CRON}"` +
    ` | Cleanup: "${CLEANUP_CRON}"` +
    ` | Abandon threshold: ${ABANDON_THRESHOLD_MS / 60000}min` +
    ` | Remind interval: ${REMIND_INTERVAL_MS / 60000}min` +
    ` | Max reminders: ${MAX_REMINDERS}` +
    ` | Env: ${process.env.NODE_ENV || "development"}`
  );
};

module.exports = { startCartReminderCron, runCartAbandonmentJob, runCartCleanupJob };