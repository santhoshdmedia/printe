// utils/findUserByEmail.js
// ─────────────────────────────────────────────────────────────────────────────
// Drop-in helper that resolves a user's _id from their email address.
// Imports the User model DIRECTLY — never through models_import — so aliasing
// or circular-dependency issues in models_import cannot cause silent failures.
//
// USAGE:
//   const { findUserIdByEmail } = require('../utils/findUserByEmail');
//   const userId = await findUserIdByEmail('john@example.com');
//   // returns ObjectId | null
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

// ── Resolve the User model ────────────────────────────────────────────────────
// We try three strategies in order:
//  1. Already-registered Mongoose model  ← safest, works if model was loaded before this file
//  2. Direct require of your model file  ← works if path is correct
//  3. Re-declare an inline minimal schema ← last resort, never fails
// ─────────────────────────────────────────────────────────────────────────────
let UserModel;

try {
  // Strategy 1: model already registered by Mongoose (most reliable)
  UserModel = mongoose.model('User');
  console.log('[findUserByEmail] ✓ Using pre-registered Mongoose model "User"');
} catch (_notRegistered) {
  try {
    // Strategy 2: require directly
    // ⚠️  Adjust this path to match where your User model file actually lives!
    UserModel = require('../models/User.model');
    console.log('[findUserByEmail] ✓ Loaded User model via require()');
  } catch (requireErr) {
    // Strategy 3: minimal inline schema — only _id + email, same collection
    console.warn('[findUserByEmail] ⚠ Could not require User model, using inline schema. Error:', requireErr.message);
    const minimalUserSchema = new mongoose.Schema(
      { email: { type: String, lowercase: true, trim: true } },
      { collection: 'user' }   // ← must match your actual collection name
    );
    // Only register once
    UserModel = mongoose.models.User || mongoose.model('User', minimalUserSchema);
  }
}

// ── Main exported function ────────────────────────────────────────────────────
/**
 * Look up a user by email and return their _id (ObjectId) or null.
 * Never throws — failures are logged and null is returned so order
 * creation always continues even for guest/unknown emails.
 *
 * @param {string|null|undefined} email
 * @returns {Promise<mongoose.Types.ObjectId|null>}
 */
const findUserIdByEmail = async (email) => {
  // ── Guard: nothing to look up ─────────────────────────────────────────────
  if (!email || typeof email !== 'string') {
    console.log('[findUserByEmail] skipped — no email provided');
    return null;
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (!normalizedEmail) {
    console.log('[findUserByEmail] skipped — email is empty after trim');
    return null;
  }

  // ── Guard: DB not connected yet ───────────────────────────────────────────
  // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  if (mongoose.connection.readyState !== 1) {
    console.warn(`[findUserByEmail] ⚠ MongoDB not connected (state=${mongoose.connection.readyState}), skipping lookup`);
    return null;
  }

  try {
    console.log(`[findUserByEmail] querying email: "${normalizedEmail}" in collection: "${UserModel.collection.collectionName}"`);

    const user = await UserModel
      .findOne({ email: normalizedEmail })
      .select('_id')   // fetch only _id — faster
      .lean();         // plain JS object, not a Mongoose document

    if (user) {
      console.log(`[findUserByEmail] ✓ Found user_id: ${user._id}`);
      return user._id;  // ObjectId — Mongoose accepts this for ref fields
    }

    console.log(`[findUserByEmail] ⚠ No user found for: "${normalizedEmail}" — treating as guest order`);
    return null;

  } catch (err) {
    // Log the REAL error (this was the silent-swallow bug in the old code)
    console.error(`[findUserByEmail] ✗ DB error for "${normalizedEmail}":`, err.message);
    console.error('[findUserByEmail]   Stack:', err.stack);
    return null;
  }
};

module.exports = { findUserIdByEmail };