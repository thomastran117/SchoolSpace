import { z } from "zod";

const RoleSchema = z.object({
  role: z.enum(["student", "teacher", "assistant"]),
});

const UserSchema = z
  .object({
    username: z
      .string()
      .min(4, "Username must be at least 4 characters long")
      .max(20, "Username cannot exceed 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      )
      .optional(),

    name: z
      .string()
      .min(2, "Name must be at least 2 characters long")
      .max(30, "Name cannot exceed 30 characters")
      .regex(
        /^[a-zA-Z\s'-]+$/,
        "Name can only contain letters, spaces, apostrophes, or hyphens",
      )
      .optional(),

    address: z
      .string()
      .min(5, "Address must be at least 5 characters long")
      .max(100, "Address cannot exceed 100 characters")
      .optional(),

    school: z
      .string()
      .min(2, "School must be at least 2 characters long")
      .max(50, "School cannot exceed 50 characters")
      .optional(),

    phone: z
      .string()
      .regex(
        /^\+?[0-9\s\-()]{7,20}$/,
        "Phone must be a valid phone number (digits, +, -, or spaces)",
      )
      .optional(),

    faculty: z
      .string()
      .min(2, "Faculty must be at least 2 characters long")
      .max(30, "Faculty cannot exceed 30 characters")
      .optional(),
  })
  .refine(
    (data) =>
      !!(
        data.username ||
        data.name ||
        data.address ||
        data.school ||
        data.phone ||
        data.faculty
      ),
    {
      message:
        "At least one field (username, name, address, school, phone, or faculty) must be provided.",
      path: ["body"],
    },
  );

type RoleUpdateDto = z.infer<typeof RoleSchema>;
type UserUpdateDto = z.infer<typeof UserSchema>;

export { RoleSchema, UserSchema, RoleUpdateDto, UserUpdateDto };
