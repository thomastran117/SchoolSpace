/**
 * @file coreSchema.ts
 * @description
 * General-purpose Zod schemas reused across the API (params, pagination, auth, files, etc.)
 *
 * @module dto
 * @version 1.0.0
 * @auth Thomas
 */

import { z } from "zod";

const TrimmedString = z.string().transform((s) => s.trim());

const CoerceBoolean = z.preprocess((v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (["true", "1", "yes", "y"].includes(s)) return true;
    if (["false", "0", "no", "n"].includes(s)) return false;
  }
  return v;
}, z.boolean());

const CoerceInt = (opts?: { min?: number; max?: number; default?: number }) =>
  z.preprocess((v) => {
    if (v === undefined || v === null || v === "") return opts?.default ?? v;
    if (typeof v === "number") return v;
    if (typeof v === "string" && /^\d+$/.test(v.trim())) return Number(v.trim());
    return v;
  }, z.number().int())
    .refine((n) => (opts?.min !== undefined ? n >= opts.min : true), {
      message: `must be >= ${opts?.min}`,
    })
    .refine((n) => (opts?.max !== undefined ? n <= opts.max : true), {
      message: `must be <= ${opts?.max}`,
    });

const EmailSchema = TrimmedString.pipe(
  z.string().email("invalid email").max(254, "email too long")
);

const UrlSchema = TrimmedString.pipe(
  z.string().url("invalid url").max(2048, "url too long")
);

const UuidSchema = TrimmedString.pipe(
  z.string().uuid("invalid uuid")
);

const NameSchema = TrimmedString.pipe(
  z.string().min(1, "name is required").max(80, "name too long")
);

const NonEmptyStringSchema = TrimmedString.pipe(
  z.string().min(1, "required")
);

const PositiveIntStringToNumber = z
  .string()
  .regex(/^\d+$/, "must be an integer string")
  .transform(Number)
  .refine((n) => n > 0, "must be positive");

const IdParamSchema = z.object({
  id: PositiveIntStringToNumber,
});

const TwoIdParamsSchema = z.object({
  id: PositiveIntStringToNumber,
  subId: PositiveIntStringToNumber,
});

const PaginationQuerySchema = z.object({
  page: CoerceInt({ min: 1, default: 1 }).optional(),
  limit: CoerceInt({ min: 1, max: 100, default: 15 }).optional(),
});

const SortDirectionSchema = z.enum(["asc", "desc"]);

const OrderBySchema = z.object({
  orderBy: TrimmedString.pipe(z.string().max(64)).optional(),
  orderDir: SortDirectionSchema.optional(),
});

const TokenQuerySchema = z.object({
  token: TrimmedString.pipe(z.string().min(10, "token is required").max(2000)).optional(),
});

const BearerAuthHeaderSchema = z
  .string()
  .regex(/^Bearer\s+.+$/i, "invalid Authorization header");

const OtpCodeSchema = z
  .string()
  .regex(/^\d{6}$/, "code must be exactly 6 digits");

const CaptchaSchema = z.string().min(10).max(5000);

const FileTypeSchema = z.enum(["avatar", "banner", "document", "image", "other"]).or(
  TrimmedString.pipe(z.string().min(1))
);

const FileNameSchema = TrimmedString.pipe(
  z.string().regex(
    /^[a-zA-Z0-9._-]{1,200}$/,
    "invalid filename"
  )
);

const FileParamsSchema = z.object({
  type: FileTypeSchema,
  fileName: FileNameSchema.optional(),
});

const ImageMimeSchema = z.enum(["image/png", "image/jpeg", "image/webp", "image/gif"]);

const SearchQuerySchema = z.object({
  q: TrimmedString.pipe(z.string().max(200)).optional(),
});
const CsvStringArraySchema = z
  .preprocess((v) => {
    if (Array.isArray(v)) return v;
    if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
    return v;
  }, z.array(z.string()))
  .optional();

const IncludeDeletedSchema = z.object({
  includeDeleted: CoerceBoolean.optional(),
});

export {
  TrimmedString,
  CoerceBoolean,
  CoerceInt,
  EmailSchema,
  NameSchema,
  UrlSchema,
  UuidSchema,
  NonEmptyStringSchema,
  PositiveIntStringToNumber,
  IdParamSchema,
  TwoIdParamsSchema,
  PaginationQuerySchema,
  SortDirectionSchema,
  OrderBySchema,
  SearchQuerySchema,
  CsvStringArraySchema,
  IncludeDeletedSchema,
  TokenQuerySchema,
  BearerAuthHeaderSchema,
  OtpCodeSchema,
  CaptchaSchema,
  FileParamsSchema,
  FileTypeSchema,
  FileNameSchema,
  ImageMimeSchema,
};

export type FileParams = z.infer<typeof FileParamsSchema>;
export type TokenQuery = z.infer<typeof TokenQuerySchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
