/**
 * @file authSchema.ts
 * @description
 * Defines the DTOs for the Auth controller
 *
 * @module dto
 * @version 1.0.0
 * @auth Thomas
 */
import { z } from "zod";

const EmailSchema = z.string().trim().toLowerCase().email().max(100);

const PasswordSchema = z.string().min(6).max(128);

const CaptchaSchema = z.string().trim().min(1).max(4000);

const RoleSchema = z.enum(["student", "teacher"]);

const IdTokenSchema = z.string().trim().min(10).max(1500);

const VerifyCodeSchema = z
  .string()
  .trim()
  .length(6, "Code must be exactly 6 characters");

const WithEmail = { email: EmailSchema };
const WithPassword = { password: PasswordSchema };
const WithCaptcha = { captcha: CaptchaSchema };

const LoginSchema = z.object({
  ...WithEmail,
  ...WithPassword,
  ...WithCaptcha,
  remember: z.boolean().optional(),
});

const SignupSchema = z.object({
  ...WithEmail,
  ...WithPassword,
  ...WithCaptcha,
  role: RoleSchema,
});

const VerifySchema = z.object({
  ...WithEmail,
  ...WithCaptcha,
  code: VerifyCodeSchema,
});

const ChangePasswordSchema = z.object({
  ...WithPassword,
});

const ForgotPasswordSchema = z.object({
  ...WithEmail,
});

const MicrosoftSchema = z.object({
  id_token: IdTokenSchema,
});

const GoogleSchema = MicrosoftSchema;
const AppleSchema = MicrosoftSchema;

type LoginDto = z.infer<typeof LoginSchema>;
type SignupDto = z.infer<typeof SignupSchema>;
type VerifyDto = z.infer<typeof VerifySchema>;
type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;
type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
type MicrosoftDto = z.infer<typeof MicrosoftSchema>;
type GoogleDto = z.infer<typeof GoogleSchema>;
type AppleDto = z.infer<typeof AppleSchema>;

interface AuthResponseDto {
  message: string;
  accessToken: string;
  role: z.infer<typeof RoleSchema> | string;
  avatar?: string;
  username?: string;
}

export {
  AppleSchema,
  ChangePasswordSchema,
  ForgotPasswordSchema,
  GoogleSchema,
  LoginSchema,
  MicrosoftSchema,
  SignupSchema,
  VerifySchema,
  RoleSchema,
  EmailSchema,
  PasswordSchema,
  CaptchaSchema,
  IdTokenSchema,
};

export type {
  AppleDto,
  AuthResponseDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  GoogleDto,
  LoginDto,
  MicrosoftDto,
  SignupDto,
  VerifyDto,
};
