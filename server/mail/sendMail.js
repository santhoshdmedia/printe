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

const otpMail = async (values) => {
  try {
    const result = await webmailTransporter.sendMail({
      from: '"Printe" <info@printe.in>',
      to: values.email,
      subject: "Your OTP Verification Code - Printe",
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
    
    console.log('✅ Inquiry email sent successfully');
    return true;
  } catch (err) {
    console.log("❌ Error sending inquiry email:", err.message);
    return false;
  }
};

const notifyMail = async (values) => {
  try {
    // Send email to admin
    const adminMailResult = await webmailTransporter.sendMail({
      from: 'info@printe.in',
      to: 'info@printe.in',
      subject: `📦 Back in Stock Notification Request - ${values.productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 700px; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 3px 12px rgba(0,0,0,0.1);">
            <h2 style="background:#ff6b35; color: white; padding: 15px; border-radius: 5px; text-align: center; font-size: 22px; margin: 0;">
              📦 Product Back in Stock Notification Request
            </h2>
            
            <div style="padding: 25px 0;">
              <!-- Product Information -->
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ff6b35;">
                <h3 style="color: #333; margin-top: 0; font-size: 18px;">
                  🛍️ Product Details
                </h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">
                      <strong>Product Name:</strong>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">
                      ${values.productName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">
                      <strong>Product ID:</strong>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">
                      ${values.productId}
                    </td>
                  </tr>
             
                </table>
              </div>
              
              <!-- Customer Information -->
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #007BFF;">
                <h3 style="color: #333; margin-top: 0; font-size: 18px;">
                  👤 Customer Information
                </h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666; width: 150px;">
                      <strong>Name:</strong>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">
                      ${values.userName || 'Not provided'}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">
                      <strong>Email:</strong>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">
                      ${values.userEmail}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">
                      <strong>Phone:</strong>
                    </td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">
                      ${values.userPhone}
                    </td>
                  </tr>
                 
                </table>
              </div>
              
              <!-- Action Required -->
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffeaa7; margin-bottom: 20px;">
                <h3 style="color: #856404; margin-top: 0; font-size: 18px;">
                  ⚡ Action Required
                </h3>
                <p style="color: #856404; margin-bottom: 10px;">
                  Please notify this customer when the product <strong>${values.productName}</strong> is back in stock.
                </p>
                <ul style="color: #856404; margin: 0; padding-left: 20px;">
                  <li>Send an email to ${values.userEmail}</li>
                  <li>Consider sending a WhatsApp message to ${values.userPhone}</li>
                  <li>Update product stock in the admin panel</li>
                </ul>
              </div>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #ddd;">
            
            <div style="text-align: center; padding-top: 20px;">
              <a href="https://admin.printe.in" 
                 style="background: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                🔧 Go to Admin Panel
              </a>
            </div>
            
            <p style="text-align: center; font-size: 12px; color: #999; margin-top: 30px;">
              This notification was automatically generated by the Printe system.
            </p>
          </div>
        </div>
      `,
    });

    // Send confirmation email to user
    const userMailResult = await webmailTransporter.sendMail({
      from: '"Printe" <info@printe.in>',
      to: values.userEmail,
      subject: `✅ We'll notify you when ${values.productName} is available`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 3px 12px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 25px;">
              <div style="background: #28a745; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                <span style="color: white; font-size: 28px;">✓</span>
              </div>
              <h1 style="color: #333; margin-bottom: 10px;">
                Thank You for Your Interest!
              </h1>
              <p style="color: #666; font-size: 16px;">
                We've received your request for <strong>${values.productName}</strong>
              </p>
            </div>
            
            <div style="padding: 20px; background: #e7f5ff; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #0056b3; margin-top: 0; font-size: 18px;">
                📋 What Happens Next?
              </h3>
              <ul style="color: #333; line-height: 1.6;">
                <li>We'll notify you via email when <strong>${values.productName}</strong> is back in stock</li>
                <li>You'll receive updates about availability and exclusive offers</li>
                <li>Our team will prioritize restocking this product</li>
              </ul>
            </div>
            
            <div style="margin-bottom: 25px;">
              <h3 style="color: #333; font-size: 16px; margin-bottom: 10px;">
                📦 Product Information
              </h3>
              <p style="color: #666;">
                <strong>Product:</strong> ${values.productName}<br>
                <strong>Request Date:</strong> ${new Date(values.timestamp).toLocaleString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                  dateStyle: 'medium'
                })}
              </p>
              <div style="text-align: center; margin-top: 15px;">
                <a href="${values.productUrl}" 
                   style="background: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  🔗 View Product Page
                </a>
              </div>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #ddd;">
            
            <div style="text-align: center; padding-top: 20px;">
              <h4 style="color: #666; font-size: 14px; margin-bottom: 15px;">
                💡 While You Wait...
              </h4>
              <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
                Explore similar products that might interest you:
              </p>
              <a href="https://printe.in" 
                 style="border: 2px solid #ff6b35; color: #ff6b35; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                🛍️ Browse Other Products
              </a>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #ddd; margin: 25px 0;">
            
            <p style="text-align: center; font-size: 12px; color: #999;">
              This is an automated message. Please do not reply to this email.<br>
              If you have any questions, contact us at <a href="mailto:support@printe.in" style="color: #007BFF;">support@printe.in</a>
            </p>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #666; font-size: 14px;">
                <strong>Follow us:</strong>
                <br>
                <a href="https://facebook.com/printe" style="color: #1877F2; margin: 0 5px;">Facebook</a> • 
                <a href="https://instagram.com/printe" style="color: #E4405F; margin: 0 5px;">Instagram</a> • 
                <a href="https://twitter.com/printe" style="color: #1DA1F2; margin: 0 5px;">Twitter</a>
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log(`✅ Notification emails sent successfully:
      - Admin notification sent
      - User confirmation sent to: ${values.userEmail}`);
    return true;
  } catch (err) {
    console.log("❌ Error sending notification emails:", err.message);
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

module.exports = { 
  sendMail, 
  otpMail, 
  inquiryMail, 
  notifyMail,  // Added this line
  orderMail, 
  orderStatusMail 
};