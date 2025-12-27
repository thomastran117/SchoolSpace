import { AssignmentRepository } from "../repository/assignmentRepository";
import { CatalogueRepository } from "../repository/catalogueRepository";
import { CourseRepository } from "../repository/courseRepository";
import { EnrollmentRepository } from "../repository/enrollmentRepository";
import { GradeRepository } from "../repository/gradeRepository";
import { UserRepository } from "../repository/userRepository";
import logger from "../utility/logger";
import type { Registration } from "./container.types";

function registerRepositoryModules(): Map<string, Registration<any>> {
  try {
    const repositories = new Map<string, Registration<any>>();

    repositories.set("UserRepository", {
      factory: () => new UserRepository(),
      lifetime: "singleton",
    });

    repositories.set("CourseRepository", {
      factory: () => new CourseRepository(),
      lifetime: "singleton",
    });

    repositories.set("CatalogueRepository", {
      factory: () => new CatalogueRepository(),
      lifetime: "singleton",
    });

    repositories.set("EnrollmentRepository", {
      factory: () => new EnrollmentRepository(),
      lifetime: "singleton",
    });

    repositories.set("AssignmentRepository", {
      factory: () => new AssignmentRepository(),
      lifetime: "singleton",
    });

    repositories.set("GradeRepository", {
      factory: () => new GradeRepository(),
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
