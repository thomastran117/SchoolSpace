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
          break;
        case "strict":
        default:
          effectiveSchema = schema.strict() as unknown as T;
      }
    }

    const data = (req as any)[source];

    if (
      source === "body" &&
      (data === undefined ||
        data === null ||
        (typeof data === "object" && Object.keys(data).length === 0))
    ) {
      const expectedFields =
        effectiveSchema instanceof ZodObject
          ? Object.keys(effectiveSchema.shape)
          : [];

      return res.status(400).json({
        errors: [
          {
            field: source,
            message:
              "Missing or empty JSON body. Please provide valid JSON input.",
            expectedFields,
          },
        ],
      });
    }

    const parseResult = effectiveSchema.safeParse(data);

    if (!parseResult.success) {
      return res.status(400).json({
        errors: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    (req as any)[source] = parseResult.data;
    next();
  };
