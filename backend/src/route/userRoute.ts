/**
 * @file userRoute.js
 * @description Defines all user profile related routes and user fetching
 * @module route
 *
 * @version 1.0.0
 * @author Thomas
 */
/**
 * Imports
 */
import type { FastifyInstance } from "fastify";

import { MongoIdParamSchema } from "../dto/idSchema";
import { RoleSchema, UserSchema } from "../dto/userSchema";
import { authDependency } from "../hooks/authHook";
import { useController } from "../hooks/controllerHook";
import { safeUploadAvatar } from "../hooks/uploadHook";
import { validate } from "../hooks/validateHook";

async function userRoutes(app: FastifyInstance) {
  app.get(
    "/:id",
    {
      preHandler: authDependency,
      preValidation: validate(MongoIdParamSchema, "params"),
    },
    useController("UserController", (c) => c.getUser)
  );

  app.get(
    "/",
    {
      preHandler: authDependency,
    },
    useController("UserController", (c) => c.getUser)
  );

  app.delete(
    "/:id",
    {
      preHandler: authDependency,
      preValidation: validate(MongoIdParamSchema, "params"),
    },
    useController("UserController", (c) => c.deleteUser)
  );

  app.delete(
    "/",
    {
      preHandler: authDependency,
    },
    useController("UserController", (c) => c.deleteUser)
  );

  app.put(
    "/avatar/:id",
    {
      preHandler: [authDependency, safeUploadAvatar],
      preValidation: validate(MongoIdParamSchema, "params"),
    },
    useController("UserController", (c) => c.updateAvatar)
  );
  app.put(
    "/avatar",
    {
      preHandler: [authDependency, safeUploadAvatar],
    },
    useController("UserController", (c) => c.updateAvatar)
  );

  app.put(
    "/role/:id",
    {
      preHandler: authDependency,
      preValidation: [
        validate(MongoIdParamSchema, "params"),
        validate(RoleSchema, "body"),
      ],
    },
    useController("UserController", (c) => c.updateRole)
  );

  app.put(
    "/role",
    {
      preHandler: authDependency,
      preValidation: validate(RoleSchema, "body"),
    },
    useController("UserController", (c) => c.updateRole)
  );

  app.put(
    "/:id",
    {
      preHandler: authDependency,
      preValidation: [
        validate(MongoIdParamSchema, "params"),
        validate(UserSchema, "body"),
      ],
    },
    useController("UserController", (c) => c.updateUser)
  );

  app.put(
    "/",
    {
      preHandler: authDependency,
      preValidation: validate(UserSchema, "body"),
    },
    useController("UserController", (c) => c.updateUser)
  );
}

export { userRoutes };
