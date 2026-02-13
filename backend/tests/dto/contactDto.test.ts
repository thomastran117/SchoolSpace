import {
  CreateContactSchema,
  UpdateContactSchema,
} from "../../src/dto/contactSchema";

describe("Contact Zod DTO Schemas", () => {
  describe("CreateContactSchema", () => {
    it("accepts valid input and normalizes email + captcha", () => {
      const input = {
        email: "  TEST@Example.COM  ",
        topic: "Help me",
        message: "This is a valid message.",
        captcha: "  token  ",
      };

      const parsed = CreateContactSchema.parse(input);

      expect(parsed.email).toBe("test@example.com"); // trim + lowercase
      expect(parsed.captcha).toBe("token"); // trim
      expect(parsed.topic).toBe("Help me");
      expect(parsed.message).toBe("This is a valid message.");
    });

    it("rejects invalid email", () => {
      const res = CreateContactSchema.safeParse({
        email: "not-an-email",
        topic: "Help me",
        message: "This is a valid message.",
        captcha: "token",
      });

      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues.some((i) => i.path.join(".") === "email")).toBe(
          true
        );
      }
    });

    it("rejects topic shorter than 4 or longer than 100", () => {
      const tooShort = CreateContactSchema.safeParse({
        email: "a@b.com",
        topic: "abc",
        message: "This is a valid message.",
        captcha: "token",
      });
      expect(tooShort.success).toBe(false);

      const tooLong = CreateContactSchema.safeParse({
        email: "a@b.com",
        topic: "a".repeat(101),
        message: "This is a valid message.",
        captcha: "token",
      });
      expect(tooLong.success).toBe(false);
    });

    it("rejects message shorter than 10 or longer than 1000", () => {
      const tooShort = CreateContactSchema.safeParse({
        email: "a@b.com",
        topic: "Help me",
        message: "short",
        captcha: "token",
      });
      expect(tooShort.success).toBe(false);

      const tooLong = CreateContactSchema.safeParse({
        email: "a@b.com",
        topic: "Help me",
        message: "a".repeat(1001),
        captcha: "token",
      });
      expect(tooLong.success).toBe(false);
    });

    it("rejects empty captcha, and captcha longer than 4000", () => {
      const empty = CreateContactSchema.safeParse({
        email: "a@b.com",
        topic: "Help me",
        message: "This is a valid message.",
        captcha: "",
      });
      expect(empty.success).toBe(false);

      const tooLong = CreateContactSchema.safeParse({
        email: "a@b.com",
        topic: "Help me",
        message: "This is a valid message.",
        captcha: "a".repeat(4001),
      });
      expect(tooLong.success).toBe(false);
    });
  });

  describe("UpdateContactSchema", () => {
    it("allows partial fields (empty object is valid schema-wise)", () => {
      const res = UpdateContactSchema.safeParse({});
      expect(res.success).toBe(true);
      if (res.success) expect(res.data).toEqual({});
    });

    it("still validates provided fields", () => {
      const res = UpdateContactSchema.safeParse({
        email: "NOTANEMAIL",
      });
      expect(res.success).toBe(false);
    });

    it("normalizes provided email", () => {
      const res = UpdateContactSchema.parse({
        email: "  TEST@Example.COM  ",
      });

      expect(res.email).toBe("test@example.com");
    });
  });
});
