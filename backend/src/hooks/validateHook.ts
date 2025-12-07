import type { FastifyRequest } from "fastify";
import { ZodObject, ZodSchema } from "zod";
import env from "../config/envConfigs";
import { httpError } from "../utility/httpUtility";

const VALIDATION_MODE = env.zod_configuration ?? "strict";
type ValidationSource = "body" | "params" | "query";

export function validate<T extends ZodSchema>(
  schema: T,
  source: ValidationSource = "body",
) {
  return async (req: FastifyRequest) => {
    let effectiveSchema = schema;

    if (schema instanceof ZodObject) {
      switch (VALIDATION_MODE) {
        case "strip":
          effectiveSchema = schema.strip() as unknown as T;
          break;
        case "passthrough":
          effectiveSchema = schema.passthrough() as unknown as T;
          break;
        case "strict":
        default:
          effectiveSchema = schema.strict() as unknown as T;
      }
    }

    const data =
      source === "body"
        ? req.body
        : source === "params"
          ? req.params
          : req.query;

    const isEmptyObject =
      data === undefined ||
      data === null ||
      (typeof data === "object" && Object.keys(data).length === 0);

    if (source === "query" && isEmptyObject) return;

    if (isEmptyObject && (source === "body" || source === "params")) {
      const expectedFields =
        effectiveSchema instanceof ZodObject
          ? Object.keys(effectiveSchema.shape)
          : [];

      throw httpError(400, "Missing or empty input", {
        source,
        expectedFields,
      });
    }

    const parseResult = effectiveSchema.safeParse(data);

    if (!parseResult.success) {
      throw httpError(400, "Validation failed", {
        source,
        errors: parseResult.error.issues.map((issue) => ({
          field: issue.path.join(".") || source,
          message: issue.message,
        })),
      });
    }

    if (source === "body") req.body = parseResult.data as any;
    else if (source === "params") req.params = parseResult.data as any;
    else req.query = parseResult.data as any;
  };
}
