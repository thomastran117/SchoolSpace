/**
 * @file emailService.ts
 * @description
 * Provides functions for sending verification, welcome, and notification emails via Gmail using Nodemailer.
 *
 * @module service
 * @version 1.0.0
 * @auth Thomas
 */

import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import config from "../config/envManager";
import logger from "../utility/logger";

/* -------------------------------------------------------------
 * Transporter Setup
 * ----------------------------------------------------------- */

/**
 * Nodemailer transporter instance configured for Gmail.
 * Uses environment variables from EnvManager.
 */
const transporter: Transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.email_user,
    pass: config.email_pass,
  },
});

/* -------------------------------------------------------------
 * Email Types
 * ----------------------------------------------------------- */

interface MailPayload {
  to: string;
  subject: string;
  html: string;
}

/* -------------------------------------------------------------
 * Core Utility
 * ----------------------------------------------------------- */

/**
 * Sends an email using the predefined transporter.
 *
 * @param payload - The email details (to, subject, html).
 */
async function sendEmail(payload: MailPayload): Promise<void> {
  const mailOptions: SendMailOptions = {
    from: `"SchoolSpace" <${config.email_user}>`,
    ...payload,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${payload.to} (${payload.subject})`);
  } catch (error: any) {
    logger.error(`Failed to send email to ${payload.to}: ${error.message}`);
    throw new Error("Failed to send email");
  }
}

/* -------------------------------------------------------------
 * Verification Email
 * ----------------------------------------------------------- */

/**
 * Sends a verification email with a unique verify URL.
 *
 * @param email - Recipient email address.
 * @param verifyUrl - Verification link.
 */
export async function sendVerificationEmail(
  email: string,
  verifyUrl: string,
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px 0; margin:0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); overflow: hidden;">
        
        <div style="background: linear-gradient(90deg, #2563eb, #4CAF50); padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; color: #fff; font-weight: 600;">SchoolSpace</h1>
        </div>
        
        <div style="padding: 32px;">
          <h2 style="font-size: 20px; color: #111; margin-top: 0;">Verify Your Email</h2>
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 16px 0;">Hi there,</p>
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
            If the button doesn’t work, copy and paste this link into your browser:
          </p>
          <p style="font-size: 14px; color: #2563eb; word-break: break-all;">
            <a href="${verifyUrl}" target="_blank" style="color: #2563eb;">${verifyUrl}</a>
          </p>

          <p style="font-size: 14px; color: #999; margin-top: 32px;">
            If you did not create an account, ignore this email. The link will expire in <strong>24 hours</strong>.
          </p>
        </div>

        <div style="background-color: #f9fafb; text-align: center; padding: 20px; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} SchoolSpace. All rights reserved.
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "Verify Your Email Address",
    html,
  });
}

/* -------------------------------------------------------------
 * Welcome Email
 * ----------------------------------------------------------- */

/**
 * Sends a welcome email to a new user.
 *
 * @param email - Recipient email address.
 */
export async function sendWelcomeEmail(email: string): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px 0; margin:0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); overflow: hidden;">

        <div style="background: linear-gradient(90deg, #2563eb, #4CAF50); padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; color: #fff; font-weight: 600;">SchoolSpace</h1>
        </div>

        <div style="padding: 32px;">
          <h2 style="font-size: 20px; color: #111; margin-top: 0;">Welcome Aboard! 🎉</h2>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi there,</p>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            We’re excited to have you join <strong>SchoolSpace</strong>! Explore your dashboard, connect with peers, and make the most of your learning experience.
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${config.frontend_client}" target="_blank"
              style="background-color: #4CAF50; color: #ffffff; text-decoration: none; 
                     padding: 14px 28px; font-size: 16px; border-radius: 8px; 
                     display: inline-block; font-weight: 600; letter-spacing: 0.3px;">
              Go to SchoolSpace
            </a>
          </div>

          <p style="font-size: 14px; color: #999; margin-top: 32px;">
            If you ever need help, our support team is just a message away.<br/>
            Let’s build something great together 🚀
          </p>
        </div>

        <div style="background-color: #f9fafb; text-align: center; padding: 20px; font-size: 12px; color: #999;">
          &copy; ${new Date().getFullYear()} SchoolSpace. All rights reserved.
        </div>
      </div>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "Welcome to SchoolSpace 🎉",
    html,
  });
}

/* -------------------------------------------------------------
 * Placeholder Templates for Future Use
 * ----------------------------------------------------------- */

export async function sendGradeEmail(
  email: string,
  course: string,
  grade: string,
): Promise<void> {
  // TODO: Implement grade notification email
  logger.info(`sendGradeEmail() called for ${email} (${course}, ${grade})`);
}

export async function sendAnnouncementEmail(
  email: string,
  course: string,
): Promise<void> {
  // TODO: Implement announcement email
  logger.info(`sendAnnouncementEmail() called for ${email} (${course})`);
}

export async function sendAssignmentEmail(
  email: string,
  course: string,
): Promise<void> {
  // TODO: Implement assignment notification email
  logger.info(`sendAssignmentEmail() called for ${email} (${course})`);
}
