/**
 * @file catalogueRoutes.ts
 * @description Routes for managing course catalogue templates
 */

import type { FastifyInstance } from "fastify";
import {
  CreateCatalogueSchema,
  QueryCatalogueSchema,
  UpdateCatalogueSchema,
} from "../dto/catalogueSchema";
import { MongoIdParamSchema } from "../dto/idSchema";
import { authDependency } from "../hooks/authHook";
import { useController } from "../hooks/controllerHook";
import { validate } from "../hooks/validateHook";

async function catalogueRoutes(app: FastifyInstance) {
  app.get(
    "/:id",
    {
      preValidation: validate(MongoIdParamSchema, "params"),
    },
    useController("CatalogueController", (c) => c.getCourseTemplate),
  );

  app.get(
    "/",
    {
      preValidation: validate(QueryCatalogueSchema, "query"),
    },
    useController("CatalogueController", (c) => c.getCourseTemplates),
  );

  app.post(
    "/",
    {
      preHandler: authDependency,
      preValidation: validate(CreateCatalogueSchema, "body"),
    },
    useController("CatalogueController", (c) => c.createCourseTemplate),
  );

  app.put(
    "/:id",
    {
      preHandler: authDependency,
      preValidation: [
        validate(MongoIdParamSchema, "params"),
        validate(UpdateCatalogueSchema, "body"),
      ],
    },
    useController("CatalogueController", (c) => c.updateCourseTemplate),
  );

  app.delete(
    "/:id",
    {
      preHandler: authDependency,
      preValidation: validate(MongoIdParamSchema, "params"),
    },
    useController("CatalogueController", (c) => c.deleteCourseTemplate),
  );
}

export { catalogueRoutes };
