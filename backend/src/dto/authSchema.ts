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

const MicrosoftSchema = z.object({
  id_token: z.string().min(10).max(1500),
});

const GoogleSchema = MicrosoftSchema;

type LoginDto = z.infer<typeof LoginSchema>;
type SignupDto = z.infer<typeof SignupSchema>;
type MicrosoftDto = z.infer<typeof MicrosoftSchema>;
type GoogleDto = z.infer<typeof GoogleSchema>;

interface AuthResponseDto {
  message: string;
  accessToken: string;
  role: string;
  avatar?: string;
  username?: string;
}

export { LoginSchema, SignupSchema, MicrosoftSchema, GoogleSchema };

export type { LoginDto, SignupDto, MicrosoftDto, GoogleDto, AuthResponseDto };
