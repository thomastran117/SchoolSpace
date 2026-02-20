/**
 * @file container.controllers.ts
 * @description
 * Factory methods to create controller objects
 *
 * @module container
 * @version 1.0.0
 * @auth Thomas
 */
import type { Registration } from "@container/container.types";
import { AssignmentController } from "@controller/assignmentController";
import { AuthController } from "@controller/authController";
import { CatalogueController } from "@controller/catalogueController";
import { ContactController } from "@controller/contactController";
import { CourseController } from "@controller/courseController";
import { FileController } from "@controller/fileController";
import { GradeController } from "@controller/gradeController";
import { HealthController } from "@controller/healthController";
import { UserController } from "@controller/userController";
import logger from "@utility/logger";

function registerControllerModules(): Map<string, Registration<any>> {
  try {
    const controllers = new Map<string, Registration<any>>();

    controllers.set("AuthController", {
      factory: (scope) =>
        new AuthController({
          authService: scope.resolve("AuthService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("FileController", {
      factory: (scope) =>
        new FileController({
          fileService: scope.resolve("FileService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("UserController", {
      factory: (scope) =>
        new UserController({
          userService: scope.resolve("UserService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("CatalogueController", {
      factory: (scope) =>
        new CatalogueController({
          catalogueService: scope.resolve("CatalogueService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("CourseController", {
      factory: (scope) =>
        new CourseController({
          courseService: scope.resolve("CourseService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("AssignmentController", {
      factory: (scope) =>
        new AssignmentController({
          assignmentService: scope.resolve("AssignmentService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("GradeController", {
      factory: (scope) =>
        new GradeController({
          gradeService: scope.resolve("GradeService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("ContactController", {
      factory: (scope) =>
        new ContactController({
          contactService: scope.resolve("ContactService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("HealthController", {
      factory: (scope) => new HealthController(),
      lifetime: "scoped",
    });

    return controllers;
  } catch (err: any) {
    logger.error(
      `[Container] Controllers registration failed: ${err?.message ?? err}`
    );
    process.exit(1);
  }
}

export { registerControllerModules };
