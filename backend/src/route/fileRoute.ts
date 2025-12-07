/**
 * @file fileRoute.ts
 * @description
 * Router for file handling (upload, retrieval, deletion).
 *
 * @module route
 * @version 1.0.0
 * @auth Thomas
 */

import type { FastifyInstance } from "fastify";
import { authDependency } from "../hooks/authHook";
import { useController } from "../hooks/controllerHook";

async function fileRoutes(app: FastifyInstance) {
  app.get(
    "/:type/:fileName",
    {
      preHandler: authDependency,
    },
    useController("FileController", (c) => c.handleFetch),
  );
}

export { fileRoutes };
