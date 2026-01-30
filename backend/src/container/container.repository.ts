/**
 * @file container.repositories.ts
 * @description
 * Factory methods to create repository objects
 *
 * @module container
 * @version 1.0.0
 * @auth Thomas
 */
import * as Repositories from "../repository";
import logger from "../utility/logger";
import type { Registration } from "./container.types";

function registerRepositoryModules(): Map<string, Registration<any>> {
  try {
    const repositories = new Map<string, Registration<any>>();

    repositories.set("UserRepository", {
      factory: () => new Repositories.UserRepository(),
      lifetime: "singleton",
    });

    repositories.set("CourseRepository", {
      factory: () => new Repositories.CourseRepository(),
      lifetime: "singleton",
    });

    repositories.set("CatalogueRepository", {
      factory: () => new Repositories.CatalogueRepository(),
      lifetime: "singleton",
    });

    repositories.set("EnrollmentRepository", {
      factory: () => new Repositories.EnrollmentRepository(),
      lifetime: "singleton",
    });

    repositories.set("AssignmentRepository", {
      factory: () => new Repositories.AssignmentRepository(),
      lifetime: "singleton",
    });

    repositories.set("GradeRepository", {
      factory: () => new Repositories.GradeRepository(),
      lifetime: "singleton",
    });

    return repositories;
  } catch (err: any) {
    logger.error(
      `[Container] Repositories registration failed: ${err?.message ?? err}`
    );
    process.exit(1);
  }
}

export { registerRepositoryModules };
