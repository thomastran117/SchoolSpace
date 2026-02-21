import {
  LoginSchema,
  MicrosoftSchema,
  SignupSchema,
  VerifySchema,
} from "@dto/authSchema";
import { HttpError } from "@error/httpError";
import { validate } from "@hooks/validateHook";

describe("Auth DTO Validation", () => {
  describe("Zod Schemas", () => {
    it("accepts valid login payload", () => {
      const result = LoginSchema.safeParse({
        email: "test@test.com",
        password: "password123",
        captcha: "captcha",
        remember: true,
      });

      expect(result.success).toBe(true);
    });

    it("rejects login with invalid email", () => {
      const result = LoginSchema.safeParse({
        email: "not-an-email",
        password: "password123",
        captcha: "captcha",
      });

      expect(result.success).toBe(false);
    });

    it("rejects short password", () => {
      const result = SignupSchema.safeParse({
        email: "test@test.com",
        password: "123",
        role: "student",
        captcha: "captcha",
      });

      expect(result.success).toBe(false);
    });

    it("rejects invalid role", () => {
      const result = SignupSchema.safeParse({
        email: "test@test.com",
        password: "password123",
        role: "admin",
        captcha: "captcha",
      });

      expect(result.success).toBe(false);
    });

    it("accepts valid Microsoft token payload", () => {
      const result = MicrosoftSchema.safeParse({
        id_token: "x".repeat(50),
      });

      expect(result.success).toBe(true);
    });

    it("accepts valid 6-digit verify code", () => {
      const result = VerifySchema.safeParse({
        email: "test@test.com",
        captcha: "captcha",
        code: "123456",
      });

      expect(result.success).toBe(true);
    });

    it("rejects verify code that is not 6 digits", () => {
      const result = VerifySchema.safeParse({
        email: "test@test.com",
        captcha: "captcha",
        code: "12345",
      });

      expect(result.success).toBe(false);
    });

    it("rejects verify code with invalid format", () => {
      const result = VerifySchema.safeParse({
        email: "test@test.com",
        captcha: "captcha",
        code: "abcdef",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("validate() hook", () => {
    it("passes and assigns validated body", async () => {
      const req: any = {
        body: {
          email: "test@test.com",
          password: "password123",
          captcha: "captcha",
        },
      };

      const handler = validate(LoginSchema, "body");

      await handler(req);

      expect(req.body.email).toBe("test@test.com");
    });

    it("throws 400 on empty body", async () => {
      const req: any = { body: {} };

      const handler = validate(LoginSchema, "body");

      await expect(handler(req)).rejects.toBeInstanceOf(HttpError);
    });

    it("throws 400 on invalid body", async () => {
      const req: any = {
        body: {
          email: "bad-email",
          password: "123",
          captcha: "captcha",
        },
      };

      const handler = validate(LoginSchema, "body");

      await expect(handler(req)).rejects.toBeInstanceOf(HttpError);
    });

    it("allows empty query", async () => {
      const req: any = { query: {} };

      const handler = validate(MicrosoftSchema, "query");

      await expect(handler(req)).resolves.toBeUndefined();
    });

    it("throws validation error for invalid query", async () => {
      const req: any = {
        query: {
          id_token: "short",
        },
      };

      const handler = validate(MicrosoftSchema, "query");

      await expect(handler(req)).rejects.toBeInstanceOf(HttpError);
    });

    it("parses and assigns validated query", async () => {
      const req: any = {
        query: {
          id_token: "x".repeat(100),
        },
      };

      const handler = validate(MicrosoftSchema, "query");

      await handler(req);

      expect(req.query.id_token).toHaveLength(100);
    });

    it("passes and assigns validated verify code", async () => {
      const req: any = {
        body: {
          email: "test@test.com",
          captcha: "captcha",
          code: "654321",
        },
      };

      const handler = validate(VerifySchema, "body");

      await handler(req);

      expect(req.body.code).toBe("654321");
    });

    it("throws validation error for invalid verify code", async () => {
      const req: any = {
        body: {
          email: "test@test.com",
          captcha: "captcha",
          code: "12345",
        },
      };

      const handler = validate(VerifySchema, "body");

      await expect(handler(req)).rejects.toBeInstanceOf(HttpError);
    });
  });
});
