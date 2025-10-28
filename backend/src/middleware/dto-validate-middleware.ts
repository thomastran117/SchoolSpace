import { NextFunction, Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

export function validateDTO(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoObject = plainToInstance(dtoClass, req.body);
    const errors = await validate(dtoObject);

    if (errors.length > 0) {
      const formattedErrors = errors.flatMap((e) =>
        Object.values(e.constraints ?? {}),
      );
      return res.status(400).json({
        message: "Bad request",
        errors: formattedErrors,
      });
    }

    req.body = dtoObject;
    next();
  };
}
