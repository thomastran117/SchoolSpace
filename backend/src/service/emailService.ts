/**
 * @file emailService.ts
 * @description
 * Handles sending verification, welcome, and notification emails via Gmail using Nodemailer.
 *
 * @module service
 * @version 2.0.0
 * @auth Thomas
 */

import type { SendMailOptions, Transporter } from "nodemailer";
import nodemailer from "nodemailer";
import env from "../config/envConfigs";
import logger from "../utility/logger";
interface MailPayload {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private readonly transporter: Transporter;
  private readonly isEmailEnabled: boolean;

  constructor() {
    const hasCredentials = !!(env.email_user && env.email_pass);

    if (!hasCredentials) {
      logger.warn("Email credentials not provided — EmailService is disabled");
      this.isEmailEnabled = false;
    }

    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.email_user,
        pass: env.email_pass,
      },
    });

    this.isEmailEnabled = true;
  }

  public emailEnabled(): boolean {
    return this.isEmailEnabled;
  }

  public async sendEmail(payload: MailPayload): Promise<void> {
    const mailOptions: SendMailOptions = {
      from: `"SchoolSpace" <${env.email_user}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${payload.to} (${payload.subject})`);
    } catch (err: any) {
      logger.error(`Failed to send email to ${payload.to}: ${err.message}`);
      throw new Error("Failed to send email");
    }
  }

  public async sendVerificationEmail(
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

    await this.sendEmail({
      to: email,
      subject: "Verify Your Email Address",
      html,
    });
  }

  public async sendWelcomeEmail(email: string): Promise<void> {
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
              <a href="${env.frontend_client}" target="_blank"
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

    await this.sendEmail({
      to: email,
      subject: "Welcome to SchoolSpace 🎉",
      html,
    });
  }

  public async sendGradeEmail(
    email: string,
    course: string,
    grade: string,
  ): Promise<void> {
    logger.info(`sendGradeEmail() called for ${email} (${course}, ${grade})`);
  }

  public async sendAnnouncementEmail(
    email: string,
    course: string,
  ): Promise<void> {
    logger.info(`sendAnnouncementEmail() called for ${email} (${course})`);
  }

  public async sendAssignmentEmail(
    email: string,
    course: string,
  ): Promise<void> {
    logger.info(`sendAssignmentEmail() called for ${email} (${course})`);
  }
}

export { EmailService };
