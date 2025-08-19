const nodemailer = require("nodemailer");
const { TemplateHelper } = require("./templateHelper");

const transporter = nodemailer.createTransport({
  host: "mail.weboney.in",
  secure: true,
  port: 465,
  auth: {
    user: "manikandan@weboney.in",
    pass: "Manikandanmsm@2025",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendMail = async (values) => {
  try {
    const result = await transporter.sendMail({
      from: "manikandan@weboney.in",
      to: values.email,
      subject: TemplateHelper(values)?.subject,
      html: TemplateHelper(values)?.templete,
    });

    return true;
  } catch (err) {
    console.log(err);
  }
};

const inquiryMail = async (values) => {
  try {
    const result = await transporter.sendMail({
      from: `"${values.name}" <${values.email}>`,
      to: "rajmadhan923@gmail.com",
      subject: `New Inquiry from ${values.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
  <div style="max-width: 600px; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 3px 12px rgba(0,0,0,0.1);">
    <h2 style="background:#007BFF; color: white; padding: 12px; border-radius: 5px; text-align: center; font-size: 20px;">
      📩 New Inquiry Notification
    </h2>
    <p style="font-size: 16px; color: #333;">
      <strong>Name:</strong> ${values.name}<br>
      <strong>Email:</strong> ${values.email}<br>
      <strong>Phone:</strong> ${values.phone}<br>
      <strong>Message:</strong><br> ${values.message}
    </p>
    <hr style="border: 0; border-top: 1px solid #ddd;">
    <p style="text-align: center; font-size: 14px; color: #666;">
      Thank you for reaching out! Our team will get back to you soon.
    </p>
  </div>
</div>

      `,
    });
  } catch (err) {
    console.log("Error sending email:", err);
  }
};

const orderMail = async (values) => {
  try {
    const { subject, template } = TemplateHelper({ ...values, target: "placed order" });

    const result = await transporter.sendMail({
      from: "mlcreation806r@gmail.com",
      to: values?.delivery_address?.email,
      subject,
      html: template,
    });

    console.log("Email Sent:", result);
  } catch (err) {
    console.error("Error Sending Email:", err);
  }
};

const orderStatusMail = async (values) => {
  try {
    const { subject, template } = TemplateHelper({ ...values, target: "order status" });

    const result = await transporter.sendMail({
      from: "mlcreation806r@gmail.com",
      to: values?.delivery_address?.email,
      subject,
      html: template,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = { sendMail, inquiryMail, orderMail, orderStatusMail };
