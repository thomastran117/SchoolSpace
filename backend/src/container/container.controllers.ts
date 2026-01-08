import * as Controllers from "../controller";
import logger from "../utility/logger";
import type { Registration } from "./container.types";

function registerControllerModules(): Map<string, Registration<any>> {
  try {
    const controllers = new Map<string, Registration<any>>();

    controllers.set("AuthController", {
      factory: (scope) =>
        new Controllers.AuthController(scope.resolve("AuthService")),
      lifetime: "scoped",
    });

    controllers.set("FileController", {
      factory: (scope) =>
        new Controllers.FileController(scope.resolve("FileService")),
      lifetime: "scoped",
    });

    controllers.set("UserController", {
      factory: (scope) =>
        new Controllers.UserController(scope.resolve("UserService")),
      lifetime: "scoped",
    });

    controllers.set("CatalogueController", {
      factory: (scope) =>
        new Controllers.CatalogueController(scope.resolve("CatalogueService")),
      lifetime: "scoped",
    });

    controllers.set("CourseController", {
      factory: (scope) =>
        new Controllers.CourseController(scope.resolve("CourseService")),
      lifetime: "scoped",
    });

    controllers.set("AssignmentController", {
      factory: (scope) =>
        new Controllers.AssignmentController(
          scope.resolve("AssignmentService")
        ),
      lifetime: "scoped",
    });

    controllers.set("EnrollmentController", {
      factory: (scope) =>
        new Controllers.EnrollmentController(
          scope.resolve("EnrollmentService")
        ),
      lifetime: "scoped",
    });

    controllers.set("GradeController", {
      factory: (scope) =>
        new Controllers.GradeController(scope.resolve("GradeService")),
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
