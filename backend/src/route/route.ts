/**
 * @file index.ts
 * @description
 * Main route file to serve all API routes.
 *
 * @version 1.0.0
 */
import type { FastifyInstance } from "fastify";

import { authRoutes } from "./authRoute";
import { catalogueRoutes } from "./catalogueRoute";
import { contactRoutes } from "./contactRoute";
import { courseRoutes } from "./courseRoute";
import { fileRoutes } from "./fileRoute";
import { userRoutes } from "./userRoute";

export async function registerRoutes(app: FastifyInstance) {
  app.register(authRoutes, { prefix: "/auth" });
  app.register(userRoutes, { prefix: "/users" });
  app.register(fileRoutes, { prefix: "/files" });
  app.register(catalogueRoutes, { prefix: "/catalogues" });
  app.register(courseRoutes, { prefix: "/courses" });
  app.register(contactRoutes, { prefix: "/contacts" });
}
