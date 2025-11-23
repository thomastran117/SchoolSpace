import { z } from "zod";

const AuthSchema = z.object({
  email: z.string().email().max(100),
  password: z.string().min(6).max(128),
  captcha: z.string(),
});

const LoginSchema = AuthSchema.extend({
  remember: z.boolean().optional(),
});

const SignupSchema = AuthSchema.extend({
  role: z.enum(["student", "teacher"]),
});

const ChangePasswordSchema = z.object({
  password: z.string().min(6).max(128),
});

const ForgotPasswordSchema = z.object({
  email: z.string().email().max(100),
});

const MicrosoftSchema = z.object({
  id_token: z.string().min(10).max(1500),
});

const GoogleSchema = MicrosoftSchema;
const AppleSchema = MicrosoftSchema;

type LoginDto = z.infer<typeof LoginSchema>;
type SignupDto = z.infer<typeof SignupSchema>;
type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;
type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
type MicrosoftDto = z.infer<typeof MicrosoftSchema>;
type GoogleDto = z.infer<typeof GoogleSchema>;
type AppleDto = z.infer<typeof AppleSchema>;

interface AuthResponseDto {
  message: string;
  accessToken: string;
  role: string;
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
};
