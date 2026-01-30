/**
 * @file userRoute.ts
 * @description Defines all course related routes
 * @module route
 *
 * @version 1.0.0
 * @author Thomas
 */
/**
 * Imports
 */
import type { FastifyInstance } from "fastify";

import { IdParamSchema } from "../dto/coreSchema";
import { CreateCourseSchema, UpdateCourseSchema } from "../dto/courseSchema";
import { authDependency } from "../hooks/authHook";
import { useController } from "../hooks/controllerHook";
import { safeUploadImage } from "../hooks/uploadHook";
import { validate } from "../hooks/validateHook";

async function courseRoutes(app: FastifyInstance) {
  app.get(
    "/:id",
    {
      preValidation: validate(IdParamSchema, "params"),
    },
    useController("CourseController", (c) => c.getCourse)
  );

  app.get(
    "/",
    useController("CourseController", (c) => c.getCourses)
  );

  app.delete(
    "/:id",
    {
      preHandler: authDependency,
      preValidation: validate(IdParamSchema, "params"),
    },
    useController("CourseController", (c) => c.deleteCourse)
  );

  app.post(
    "/",
    {
      preHandler: [authDependency, safeUploadImage({ fieldName: "course" })],
      preValidation: validate(CreateCourseSchema, "body"),
    },
    useController("CourseController", (c) => c.createCourse)
  );

  app.put(
    "/:id",
    {
      preHandler: [authDependency, safeUploadImage({ fieldName: "course" })],
      preValidation: [
        validate(IdParamSchema, "params"),
        validate(UpdateCourseSchema, "body"),
      ],
    },
    useController("CourseController", (c) => c.updateCourse)
  );
}

export { courseRoutes };
