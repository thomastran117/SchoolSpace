import { ZodObject, ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";
import env from "../config/envConfigs";

const VALIDATION_MODE = env.zod_configuration ?? "strict";
type ValidationSource = "body" | "params" | "query";

export const validate =
  <T extends ZodSchema>(schema: T, source: ValidationSource = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
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

    const data = (req as any)[source];

    const isEmptyObject =
      data === undefined ||
      data === null ||
      (typeof data === "object" && Object.keys(data).length === 0);

    if (source === "query" && isEmptyObject) {
      return next();
    }

    if (isEmptyObject && (source === "body" || source === "params")) {
      const expectedFields =
        effectiveSchema instanceof ZodObject
          ? Object.keys(effectiveSchema.shape)
          : [];

      return res.status(400).json({
        errors: [
          {
            field: source,
            message: `Missing or empty ${source}. Please provide valid input.`,
            expectedFields,
          },
        ],
      });
    }

    const parseResult = effectiveSchema.safeParse(data);

    if (!parseResult.success) {
      return res.status(400).json({
        errors: parseResult.error.issues.map((issue) => ({
          field: issue.path.join(".") || source,
          message: issue.message,
        })),
      });
    }

    if (source === "query") {
      Object.assign(req.query, parseResult.data);
    } else if (source === "params") {
      Object.assign(req.params, parseResult.data);
    } else {
      (req as any).body = parseResult.data;
    }

    next();
  };
