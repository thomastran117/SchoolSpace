import {
  IsEmail,
  IsOptional,
  Length,
  MinLength,
  MaxLength,
  IsIn,
} from "class-validator";

abstract class AuthRequest {
  @IsEmail()
  @MaxLength(100, { message: "Email must not exceed 100 characters" })
  email!: string;

  @MinLength(6, { message: "Password must be at least 6 characters long" })
  @MaxLength(128, { message: "Password must not exceed 128 characters" })
  password!: string;

  @Length(10, 100, { message: "Invalid captcha length" })
  captcha!: string;
}

abstract class OAuthRequest {
  @Length(10, 100, { message: "Invalid captcha length" })
  id_token!: string;
}

class LoginRequestDTO extends AuthRequest {
  @IsOptional()
  remember?: boolean;
}

class SignupRequestDTO extends AuthRequest {
  @IsIn(["student", "teacher"], {
    message: "role must be either 'student' or 'teacher'",
  })
  role!: string;
}

class MicrosoftRequest extends OAuthRequest {}

class GoogleRequest extends OAuthRequest {}

export { LoginRequestDTO, SignupRequestDTO, MicrosoftRequest, GoogleRequest };
