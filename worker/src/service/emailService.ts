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

export type EmailJob =
  | {
      type: "VERIFY_EMAIL";
      email: string;
      verifyUrl: string;
    }
  | {
      type: "WELCOME_EMAIL";
      email: string;
    }
  | {
      type: "GENERIC";
      to: string;
      subject: string;
      html: string;
    };

class EmailService {
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: env.emailUsername,
        pass: env.emailPassword,
      },
    });
  }

  public async sendEmail(payload: MailPayload): Promise<void> {
    const mailOptions: SendMailOptions = {
      from: `"SchoolSpace" <${env.emailUsername}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    };

    await this.retry(
      async () => {
        await this.transporter.sendMail(mailOptions);
      },
      {
        maxRetries: 3,
        baseDelayMs: 500,
        maxDelayMs: 8000,
        jitterFactor: 0.3,
      },
    );
  }

  public async sendVerificationEmail(
    email: string,
    verifyUrl: string,
  ): Promise<void> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, Arial, sans-serif;
                  background-color: #0f1021; padding: 48px 0; margin:0;">
        <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff;
                    border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.25);
                    overflow: hidden;">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #6d28d9, #8b5cf6, #a78bfa);
                      padding: 28px 32px; text-align: center;">
            <h1 style="margin: 0; font-size: 26px; color: #ffffff; font-weight: 700;
                      letter-spacing: 0.5px;">
              SchoolSpace
            </h1>
            <p style="margin: 6px 0 0; font-size: 14px; color: #e9d5ff;">
              Smart learning, beautifully organized
            </p>
          </div>

          <!-- Body -->
          <div style="padding: 40px 36px;">
            <h2 style="font-size: 22px; color: #111827; margin-top: 0; font-weight: 700;">
              Verify your email address
            </h2>

            <p style="font-size: 16px; color: #374151; line-height: 1.7; margin: 20px 0;">
              Hi there,
            </p>

            <p style="font-size: 16px; color: #374151; line-height: 1.7; margin: 20px 0;">
              Thanks for joining <strong>SchoolSpace</strong> 🎓  
              Please confirm your email address to activate your account.
            </p>

            <!-- CTA -->
            <div style="text-align: center; margin: 36px 0;">
              <a href="${verifyUrl}" target="_blank"
                style="background: linear-gradient(135deg, #7c3aed, #8b5cf6);
                        color: #ffffff; text-decoration: none;
                        padding: 16px 34px; font-size: 16px;
                        border-radius: 12px; display: inline-block;
                        font-weight: 700; letter-spacing: 0.3px;
                        box-shadow: 0 12px 24px rgba(124,58,237,0.35);">
                Verify Email
              </a>
            </div>

            <!-- Fallback -->
            <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
              If the button doesn’t work, copy and paste this link into your browser:
            </p>

            <p style="font-size: 14px; color: #7c3aed; word-break: break-all; margin-top: 8px;">
              <a href="${verifyUrl}" target="_blank" style="color: #7c3aed;">
                ${verifyUrl}
              </a>
            </p>

            <div style="margin-top: 36px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 13px; color: #9ca3af; line-height: 1.6;">
                If you didn’t create a SchoolSpace account, you can safely ignore this email.
                This verification link will expire in <strong>24 hours</strong>.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; text-align: center;
                      padding: 20px; font-size: 12px; color: #9ca3af;">
            © ${new Date().getFullYear()} SchoolSpace. All rights reserved.
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
              <a href="${env.frontendClient}" target="_blank"
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

  private async retry<T>(
    operation: () => Promise<T>,
    options?: {
      maxRetries?: number;
      baseDelayMs?: number;
      maxDelayMs?: number;
      jitterFactor?: number;
    },
  ): Promise<T> {
    const {
      maxRetries = 3,
      baseDelayMs = 500,
      maxDelayMs = 10_000,
      jitterFactor = 0.3,
    } = options ?? {};

    let attempt = 0;

    while (true) {
      try {
        return await operation();
      } catch (err) {
        attempt++;

        if (attempt > maxRetries) {
          throw err;
        }

        const expDelay = Math.min(
          baseDelayMs * Math.pow(2, attempt - 1),
          maxDelayMs,
        );

        const jitter = expDelay * jitterFactor * (Math.random() * 2 - 1);

        const delay = Math.max(0, expDelay + jitter);

        logger.warn(
          `[EmailService] Retry ${attempt}/${maxRetries} in ${Math.round(
            delay,
          )}ms`,
        );

        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }
}

export { EmailService };
