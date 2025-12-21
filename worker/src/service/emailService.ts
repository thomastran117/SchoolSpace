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
      type: "FORGOT_EMAIL";
      email: string;
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

  public async sendVerificationCodeEmail(
    email: string,
    code: string,
  ): Promise<void> {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        .code-box {
          letter-spacing: 12px;
        }
      </style>
    </head>

    <body style="margin:0; padding:0; background-color:#f3f4f6;">
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,Arial,sans-serif;
                  padding:56px 0;">

        <div style="max-width:640px; margin:0 auto; background:#ffffff;
                    border-radius:18px;
                    box-shadow:0 20px 40px rgba(0,0,0,0.15);
                    overflow:hidden;">

          <!-- Header -->
          <div style="background:linear-gradient(135deg,#6d28d9,#8b5cf6,#a78bfa);
                      padding:36px 32px; text-align:center;">
            <h1 style="margin:0; font-size:28px; color:#ffffff;
                      font-weight:800; letter-spacing:0.4px;">
              SchoolSpace
            </h1>
            <p style="margin-top:8px; font-size:15px; color:#ede9fe;">
              Welcome to a smarter learning experience
            </p>
          </div>

          <!-- Body -->
          <div style="padding:44px 40px; text-align:center;">

            <h2 style="font-size:24px; font-weight:800; color:#111827; margin-top:0;">
              Verify your email ✨
            </h2>

            <p style="font-size:16px; color:#374151; line-height:1.8; margin:22px 0;">
              Use the verification code below to complete your signup.
            </p>

            <!-- OTP Code -->
            <div
              class="code-box"
              style="
                margin:36px auto;
                padding:22px 0;
                font-size:32px;
                font-weight:900;
                color:#4c1d95;
                background:#f5f3ff;
                border-radius:14px;
                text-align:center;
                width:100%;
                max-width:360px;
              "
            >
              ${code}
            </div>

            <p style="font-size:14px; color:#6b7280; margin-top:20px;">
              This code expires in <strong>15 minutes</strong>.
            </p>

            <div style="margin-top:36px; padding-top:28px; border-top:1px solid #e5e7eb;">
              <p style="font-size:13px; color:#9ca3af; line-height:1.7;">
                If you didn’t create a SchoolSpace account, you can safely ignore this email.
              </p>
            </div>

          </div>

          <!-- Footer -->
          <div style="background:#f9fafb; padding:22px; text-align:center;
                      font-size:12px; color:#9ca3af;">
            © ${new Date().getFullYear()} SchoolSpace · Built for modern learning
          </div>

        </div>
      </div>
    </body>
    </html>
    `;

    await this.sendEmail({
      to: email,
      subject: "Your SchoolSpace verification code",
      html,
    });
  }

  public async sendForgotPasswordEmail(
    email: string,
    resetUrl: string,
  ): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          .cta-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 16px 32px rgba(124,58,237,0.45) !important;
          }

          .secondary-link:hover {
            background-color: #ede9fe !important;
            color: #5b21b6 !important;
          }
        </style>
      </head>

      <body style="margin:0; padding:0; background-color:#f3f4f6;">
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,Arial,sans-serif;
                    padding:56px 0;">

          <div style="max-width:640px; margin:0 auto; background:#ffffff;
                      border-radius:18px;
                      box-shadow:0 20px 40px rgba(0,0,0,0.15);
                      overflow:hidden;">

            <!-- Header -->
            <div style="background:linear-gradient(135deg,#6d28d9,#8b5cf6,#a78bfa);
                        padding:36px 32px; text-align:center;">
              <h1 style="margin:0; font-size:28px; color:#ffffff;
                        font-weight:800; letter-spacing:0.4px;">
                SchoolSpace
              </h1>
              <p style="margin-top:8px; font-size:15px; color:#ede9fe;">
                Secure access to your account
              </p>
            </div>

            <!-- Body -->
            <div style="padding:44px 40px;">

              <h2 style="font-size:24px; font-weight:800; color:#111827; margin-top:0;">
                Reset your password 🔐
              </h2>

              <p style="font-size:16px; color:#374151; line-height:1.8; margin:22px 0;">
                We received a request to reset the password for your SchoolSpace account.
              </p>

              <p style="font-size:16px; color:#374151; line-height:1.8; margin:22px 0;">
                Click the button below to create a new password and regain access to your account.
              </p>

              <!-- Primary CTA -->
              <div style="text-align:center; margin:44px 0 28px;">
                <a href="${resetUrl}" target="_blank"
                  class="cta-button"
                  style="
                    display:inline-block;
                    padding:18px 38px;
                    font-size:16px;
                    font-weight:800;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:999px;
                    background:linear-gradient(135deg,#7c3aed,#8b5cf6,#a78bfa);
                    box-shadow:0 14px 28px rgba(124,58,237,0.35);
                    transition:all 0.25s ease;
                  ">
                  Reset Password
                </a>
              </div>

              <!-- Secondary Links -->
              <div style="text-align:center; margin-bottom:40px;">
                <a href="${env.frontendClient}/about" target="_blank"
                  class="secondary-link"
                  style="
                    display:inline-block;
                    margin:6px;
                    padding:10px 18px;
                    font-size:13px;
                    font-weight:600;
                    color:#6d28d9;
                    text-decoration:none;
                    border-radius:999px;
                    background:#f5f3ff;
                    transition:all 0.2s ease;
                  ">
                  About SchoolSpace
                </a>

                <a href="${env.frontendClient}/privacy" target="_blank"
                  class="secondary-link"
                  style="
                    display:inline-block;
                    margin:6px;
                    padding:10px 18px;
                    font-size:13px;
                    font-weight:600;
                    color:#6d28d9;
                    text-decoration:none;
                    border-radius:999px;
                    background:#f5f3ff;
                    transition:all 0.2s ease;
                  ">
                  Privacy Policy
                </a>
              </div>

              <!-- Security Notice -->
              <div style="margin-top:36px; padding-top:28px; border-top:1px solid #e5e7eb;">
                <p style="font-size:13px; color:#9ca3af; line-height:1.7;">
                  This password reset link will expire in <strong>15 minutes</strong>.
                  If you did not request a password reset, you can safely ignore this email —
                  your account remains secure.
                </p>
              </div>

            </div>

            <!-- Footer -->
            <div style="background:#f9fafb; padding:22px; text-align:center;
                        font-size:12px; color:#9ca3af;">
              © ${new Date().getFullYear()} SchoolSpace · Security you can trust
            </div>

          </div>
        </div>
      </body>
      </html>
      `;

    await this.sendEmail({
      to: email,
      subject: "Change Password Request",
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
