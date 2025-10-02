const nodemailer = require ("nodemailer");
const { TemplateHelper } = require("./templateHelper");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "santhoshprinte@gmail.com",
    pass: "yzce dawn tdtp jfbt",
  },
});

const sendMail = async (values) => {
  try {
    const result = await transporter.sendMail({
      from: "santhoshprinte@gmail.com",
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
      to: "santhoshprinte@gmail.com",
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
const otpMail = async (values) => {
  try {
    const result = await transporter.sendMail({
      from: "santhoshprinte@gmail.com",
      to: values.email,
      subject: "Your OTP Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 3px 12px rgba(0,0,0,0.1);">
            <h2 style="background:#007BFF; color: white; padding: 15px; border-radius: 5px; text-align: center; font-size: 22px; margin: 0;">
              🔐 OTP Verification
            </h2>
            <div style="padding: 20px 0; text-align: center;">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                Hello,<br>
                Use the following OTP to complete your verification process:
              </p>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 2px dashed #007BFF; display: inline-block;">
                <h1 style="color: #007BFF; font-size: 32px; letter-spacing: 8px; margin: 0; font-weight: bold;">
                  ${values.otp}
                </h1>
              </div>
              <p style="font-size: 14px; color: #666; margin-top: 20px;">
                This OTP is valid for <strong>5 minutes</strong>.<br>
                Do not share this code with anyone.
              </p>
            </div>
            <hr style="border: 0; border-top: 1px solid #ddd;">
            <p style="text-align: center; font-size: 12px; color: #999;">
              If you didn't request this OTP, please ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    return true;
  } catch (err) {
    console.log("Error sending OTP email:", err);
    return false;
  }
};



const orderMail = async (values) => {
  try {
    const { subject, template } = TemplateHelper({
      ...values,
      target: "placed order",
    });

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
    const { subject, template } = TemplateHelper({
      ...values,
      target: "order status",
    });

    const result = await transporter.sendMail({
      from: "santhoshprinte@gmail.com",
      to: values?.delivery_address?.email,
      subject,
      html: template,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = { sendMail,otpMail, inquiryMail, orderMail, orderStatusMail };
