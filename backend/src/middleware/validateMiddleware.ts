import type { ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validate =
  <T extends ZodSchema>(schema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
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
