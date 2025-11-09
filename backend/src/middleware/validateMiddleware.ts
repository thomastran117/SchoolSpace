import type { ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validate =
  <T extends ZodSchema>(schema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (
      req.body === undefined ||
      req.body === null ||
      (typeof req.body === "object" && Object.keys(req.body).length === 0)
    ) {
      return res.status(400).json({
        errors: [
          {
            field: "body",
            message: "Missing or empty JSON body. Please provide valid JSON input.",
          },
        ],
      });
    }

    const parseResult = schema.safeParse(req.body);

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

