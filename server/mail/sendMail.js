
const nodemailer = require("nodemailer");
const { TemplateHelper } = require("./templateHelper");

// Correct Hostinger SMTP configuration
const webmailTransporter = nodemailer.createTransport({
  host: "smtp.hostinger.com", // Use SMTP, not IMAP
  port: 587,
  secure: false,
  auth: {
    user: "info@printe.in",
    pass: "Printeinfo@2025", 
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000
});

// Test connection on startup
webmailTransporter.verify(function(error, success) {
  if (error) {
    console.log('❌ Hostinger SMTP Connection failed:', error.message);
  } else {
    console.log('✅ Hostinger SMTP Server is ready to send emails');
  }
});

const sendMail = async (values) => {
  try {
    const result = await webmailTransporter.sendMail({
      from: '"Printe" <info@printe.in>',
      to: values.email,
      subject: TemplateHelper(values)?.subject,
      html: TemplateHelper(values)?.templete,
    });

    console.log('✅ Email sent successfully via Hostinger');
    return true;
  } catch (err) {
    console.log("❌ Error sending email:", err.message);
    return false;
  }
};
const BNIwelcome = async (values) => {
  try {
    const result = await webmailTransporter.sendMail({
      from: '"Printe" <info@printe.in>',
      to: values.email,
      subject: TemplateHelper(values)?.subject,
      html: TemplateHelper(values)?.templete,
    });

    console.log('✅ Email sent successfully via Hostinger');
    return true;
  } catch (err) {
    console.log("❌ Error sending email:", err.message);
    return false;
  }
};

const otpMail = async (values) => {
  try {
    const result = await webmailTransporter.sendMail({
      from: '"Printe" <info@printe.in>',
      to: values.email,
      subject: "Your OTP Verification Code - Printe",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
  <div style="max-width: 600px; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 3px 12px rgba(0,0,0,0.1);">
  
    <!-- Logo -->
    <div style="text-align: center; margin-bottom: 25px;">
      <img src="https://printe.in/assets/logo-BQbty1hL.png" alt="Printe Logo" style="max-height: 70px; width: auto; display: block; margin: 0 auto;" />
    </div>
    
    <!-- OTP Content -->
    <h2 style="background:#f2c41a; color: black; padding: 15px; border-radius: 5px; text-align: center; font-size: 22px; margin: 0;">
       OTP Verification
    </h2>
    
    <div style="padding: 20px 0; text-align: center;">
      <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
        Hello,<br>
        Use the following OTP to complete your verification process:
      </p>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 2px dashed #f2c41a; display: inline-block;">
        <h1 style="color: #f2c41a; font-size: 32px; letter-spacing: 8px; margin: 0; font-weight: bold;">
          ${values.otp}
        </h1>
      </div>
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        This OTP is valid for <strong>5 minutes</strong>.<br>
        Do not share this code with anyone.
      </p>
    </div>
    
    <hr style="border: 0; border-top: 1px solid #ddd; margin: 30px 0;">
    
    <!-- Contact Information Section -->
    <div style="text-align: center; background: #060606; padding: 10px; border-radius: 8px; margin-top: 5px;">
      <h3 style="color: #ffff; margin-bottom: 6px; font-size: 16px;">Contact Information</h3>
      
      <div style="font-size: 14px; color: #fff; display:flex !important;  justify-content:space-between; ">
        
        <p>
          <strong>Email:</strong> 
          <a href="mailto:info@printe.in" style="color: #f2c41a; text-decoration: none;">
            info@printe.in
          </a>
        </p>&nbsp;&nbsp;
        <p >
          <strong>Website:</strong> 
          <a href="https://printe.in/" style="color: #f2c41a; text-decoration: none;">
            https://printe.in/
          </a>
        </p>&nbsp;&nbsp;
        <p>
          <strong>Phone:</strong> +91 95856 10000
        </p>
      </div>
    </div>
    
    <hr style="border: 0; border-top: 1px solid #ddd; margin: 25px 0;">
    
    <!-- Footer -->
    <div style="text-align: center; font-size: 12px; color: #999;">
      <p style="margin: 5px 0;">
        If you didn't request this OTP, please ignore this email.
      </p>
      <p style="margin: 5px 0;">
        This is an automated message from Printe. Please do not reply to this email.
      </p>
      <p style="margin: 10px 0; font-size: 11px; color: #777;">
        © ${new Date().getFullYear()} Printe. All rights reserved.
      </p>
    </div>
    
  </div>
</div>
      `,
    });

    console.log('✅ OTP email sent successfully to:', values.email);
    return true;
  } catch (err) {
    console.log("❌ Error sending OTP email:", err.message);
    return false;
  }
};

const inquiryMail = async (values) => {
  try {
    const result = await webmailTransporter.sendMail({
      from: '"Printe" <info@printe.in>',
      to: 'info@printe.in',
      subject: `New Inquiry from ${values.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 3px 12px rgba(0,0,0,0.1);">
            <h2 style="background:#f2c41a; color: white; padding: 12px; border-radius: 5px; text-align: center; font-size: 20px;">
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
    
    console.log('✅ Inquiry email sent successfully');
    return true;
  } catch (err) {
    console.log("❌ Error sending inquiry email:", err.message);
    return false;
  }
};

const orderMail = async (values) => {
  try {
    const { subject, template } = TemplateHelper({
      ...values,
      target: "placed order",
    });

    const result = await webmailTransporter.sendMail({
      from: '"Printe" <info@printe.in>',
      to: values?.delivery_address?.email,
      subject,
      html: template,
    });

    console.log("✅ Order email sent successfully");
    return true;
  } catch (err) {
    console.error("❌ Error sending order email:", err.message);
    return false;
  }
};

const orderStatusMail = async (values) => {
  try {
    const { subject, template } = TemplateHelper({
      ...values,
      target: "order status",
    });

    const result = await webmailTransporter.sendMail({
      from: '"Printe" <info@printe.in>',
      to: values?.delivery_address?.email,
      subject,
      html: template,
    });

    console.log("✅ Order status email sent successfully");
    return true;
  } catch (err) {
    console.log("❌ Error sending order status email:", err.message);
    return false;
  }
};

module.exports = { sendMail, otpMail, inquiryMail, orderMail, orderStatusMail };