/**
 * @file contactRoutes.ts
 * @description Routes for managing contacts
 */
import { CreateContactSchema, UpdateContactSchema } from "@dto/contactSchema";
import { PaginationQuerySchema } from "@dto/coreSchema";
import { IdParamSchema } from "@dto/coreSchema";
import { authDependency } from "@hooks/authHook";
import { useController } from "@hooks/controllerHook";
import { validate } from "@hooks/validateHook";
import type { FastifyInstance } from "fastify";

async function contactRoutes(app: FastifyInstance) {
  app.get(
    "/:id",
    {
      preHandler: authDependency,
      preValidation: validate(IdParamSchema, "params"),
    },
    useController("ContactController", (c) => c.getContactRequest)
  );

  app.get(
    "/",
    {
      preHandler: authDependency,
      preValidation: validate(PaginationQuerySchema, "query"),
    },
    useController("ContactController", (c) => c.getContactRequests)
  );

  app.post(
    "/",
    {
      preValidation: validate(CreateContactSchema, "body"),
    },
    useController("ContactController", (c) => c.createContactRequest)
  );

  app.put(
    "/:id",
    {
      preHandler: authDependency,
      preValidation: [
        validate(IdParamSchema, "params"),
        validate(UpdateContactSchema, "body"),
      ],
    },
    useController("ContactController", (c) => c.updateContactRequest)
  );

  app.delete(
    "/:id",
    {
      preHandler: authDependency,
      preValidation: validate(IdParamSchema, "params"),
    },
    useController("ContactController", (c) => c.deleteContactRequest)
  );
}

export { contactRoutes };
