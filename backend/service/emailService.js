import nodemailer from "nodemailer";
import config from "../config/envManager.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email_user,
    pass: config.email_pass,
  },
});

async function sendVerificationEmail(email, verifyUrl) {
  const mailOptions = {
    from: `"SchoolSpace" <${config.email_user}>`,
    to: email,
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px 0; margin:0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); overflow: hidden;">
          
          <div style="background: linear-gradient(90deg, #2563eb, #4CAF50); padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; color: #fff; font-weight: 600;">SchoolSpace</h1>
          </div>
          
          <div style="padding: 32px;">
            <h2 style="font-size: 20px; color: #111; margin-top: 0;">Verify Your Email</h2>
            <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 16px 0;">
              Hi there,
            </p>
            <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 16px 0;">
              Thanks for signing up! Please confirm your email address by clicking the button below:
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${verifyUrl}" target="_blank"
                style="background-color: #2563eb; color: #ffffff; text-decoration: none; 
                       padding: 14px 28px; font-size: 16px; border-radius: 8px; 
                       display: inline-block; font-weight: 600; letter-spacing: 0.3px;">
                Verify Email
              </a>
            </div>

            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              If the button doesn’t work, copy and paste the following link into your browser:
            </p>
            <p style="font-size: 14px; color: #2563eb; word-break: break-all;">
              <a href="${verifyUrl}" target="_blank" style="color: #2563eb;">${verifyUrl}</a>
            </p>

            <p style="font-size: 14px; color: #999; margin-top: 32px;">
              If you did not create an account, you can safely ignore this email.<br/>
              This link will expire in <strong>24 hours</strong> for security reasons.
            </p>
          </div>

          <div style="background-color: #f9fafb; text-align: center; padding: 20px; font-size: 12px; color: #999;">
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

async function sendWelcomeEmail(email) {
  const mailOptions = {
    from: `"SchoolSpace" <${config.email_user}>`,
    to: email,
    subject: "Welcome to SchoolSpace 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px 0; margin:0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); overflow: hidden;">

          <!-- Header -->
          <div style="background: linear-gradient(90deg, #2563eb, #4CAF50); padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; color: #fff; font-weight: 600;">SchoolSpace</h1>
          </div>

          <!-- Body -->
          <div style="padding: 32px;">
            <h2 style="font-size: 20px; color: #111; margin-top: 0;">Welcome Aboard! 🎉</h2>
            <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 16px 0;">
              Hi there,
            </p>
            <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 16px 0;">
              We’re excited to have you join <strong>SchoolSpace</strong>! You’re now part of a growing community where students and teachers connect, learn, and grow together.
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${process.env.FRONTEND_CLIENT}" target="_blank"
                style="background-color: #4CAF50; color: #ffffff; text-decoration: none; 
                       padding: 14px 28px; font-size: 16px; border-radius: 8px; 
                       display: inline-block; font-weight: 600; letter-spacing: 0.3px;">
                Go to SchoolSpace
              </a>
            </div>

            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              Explore your dashboard, connect with peers, and make the most of your learning experience.
            </p>

            <p style="font-size: 14px; color: #999; margin-top: 32px;">
              If you ever need help, our support team is just a message away.<br/>
              Let’s build something great together 🚀
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; text-align: center; padding: 20px; font-size: 12px; color: #999;">
            &copy; ${new Date().getFullYear()} SchoolSpace. All rights reserved.
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw error;
  }
}

async function sendGradeEmail(email, course, grade) {
  //TO DO
}

async function sendAnnouncementEmail(email, course) {
  //TO DO
}

async function sendAssignmentEmail(email, course) {
  //TO DO
}

export {
  sendVerificationEmail,
  sendAnnouncementEmail,
  sendAssignmentEmail,
  sendGradeEmail,
  sendWelcomeEmail,
};
