/**
 * @file container.repositories.ts
 * @description
 * Factory methods to create repository objects
 *
 * @module container
 * @version 1.0.0
 * @auth Thomas
 */
import type { Registration } from "@container/container.types";
import { AssignmentRepository } from "@repository/assignmentRepository";
import { CatalogueRepository } from "@repository/catalogueRepository";
import { ContactRepository } from "@repository/contactRepository";
import { CourseRepository } from "@repository/courseRepository";
import { EnrollmentRepository } from "@repository/enrollmentRepository";
import { GradeRepository } from "@repository/gradeRepository";
import { UserReportRepository } from "@repository/userReportRepository";
import { UserRepository } from "@repository/userRepository";
import logger from "@utility/logger";

function registerRepositoryModules(): Map<string, Registration<any>> {
  try {
    const repositories = new Map<string, Registration<any>>();

    repositories.set("UserRepository", {
      factory: () => new UserRepository(),
      lifetime: "singleton",
      deps: [],
    });

    repositories.set("CourseRepository", {
      factory: () => new CourseRepository(),
      lifetime: "singleton",
      deps: [],
    });

    repositories.set("CatalogueRepository", {
      factory: () => new CatalogueRepository(),
      lifetime: "singleton",
      deps: [],
    });

    repositories.set("EnrollmentRepository", {
      factory: () => new EnrollmentRepository(),
      lifetime: "singleton",
      deps: [],
    });

    repositories.set("AssignmentRepository", {
      factory: () => new AssignmentRepository(),
      lifetime: "singleton",
      deps: [],
    });

    repositories.set("GradeRepository", {
      factory: () => new GradeRepository(),
      lifetime: "singleton",
      deps: [],
    });

    repositories.set("ContactRepository", {
      factory: () => new ContactRepository(),
      lifetime: "singleton",
      deps: [],
    });

    repositories.set("UserReportRepository", {
      factory: () => new UserReportRepository(),
      lifetime: "singleton",
      deps: [],
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
