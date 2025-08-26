const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(email, verifyUrl) {
  const mailOptions = {
    from: `"SchoolSpace" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 40px 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Verify Your Email</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333;">Hi there,</p>
            <p style="font-size: 16px; color: #333;">Thanks for signing up! Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyUrl}" target="_blank" style="background-color: #4CAF50; color: white; text-decoration: none; padding: 12px 24px; font-size: 16px; border-radius: 6px; display: inline-block;">Verify Email</a>
            </div>
            <p style="font-size: 14px; color: #888;">If you did not create an account, no further action is required.</p>
            <p style="font-size: 14px; color: #888;">This link will expire in 24 hours for security reasons.</p>
          </div>
          <div style="background-color: #f0f0f0; text-align: center; padding: 20px; font-size: 12px; color: #999;">
            &copy; ${new Date().getFullYear()} SchoolSpace. All rights reserved.
          </div>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  sendEmail,
};