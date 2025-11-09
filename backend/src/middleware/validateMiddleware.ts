import { ZodObject, ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";
import env from "../config/envConfigs";

const VALIDATION_MODE =
  env.zod_configuration

export const validate =
  <T extends ZodSchema>(schema: T) =>
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

    if (
      req.body === undefined ||
      req.body === null ||
      (typeof req.body === "object" && Object.keys(req.body).length === 0)
    ) {
      const expectedFields =
        effectiveSchema instanceof ZodObject
          ? Object.keys(effectiveSchema.shape)
          : [];

      return res.status(400).json({
        errors: [
          {
            field: "body",
            message:
              "Missing or empty JSON body. Please provide valid JSON input.",
            expectedFields,
          },
        ],
      });
    }

    const parseResult = effectiveSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        errors: parseResult.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    req.body = parseResult.data;
    next();
  };
