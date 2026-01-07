import * as Services from "../service";
import logger from "../utility/logger";
import type { Registration } from "./container.types";

function registerServiceModules(): Map<string, Registration<any>> {
  try {
    const services = new Map<string, Registration<any>>();

    services.set("CacheService", {
      factory: () => new Services.CacheService(),
      lifetime: "singleton",
    });

    services.set("FileService", {
      factory: () => new Services.FileService(),
      lifetime: "singleton",
    });

    services.set("BasicTokenService", {
      factory: () => new Services.BasicTokenService(),
      lifetime: "singleton",
    });

    services.set("WebService", {
      factory: () => new Services.WebService(),
      lifetime: "transient",
    });

    services.set("OAuthService", {
      factory: () => new Services.OAuthService(),
      lifetime: "transient",
    });

    services.set("TokenService", {
      factory: (scope) => new Services.TokenService(scope.resolve("CacheService")),
      lifetime: "transient",
    });

    services.set("PaymentService", {
      factory: (scope) => new Services.PaymentService(scope.resolve("WebService")),
      lifetime: "scoped",
    });

    services.set("SubmissionService", {
      factory: (scope) => new Services.SubmissionService(scope.resolve("FileService")),
      lifetime: "scoped",
    });

    services.set("CatalogueService", {
      factory: (scope) =>
        new Services.CatalogueService(
          scope.resolve("CacheService"),
          scope.resolve("CatalogueRepository")
        ),
      lifetime: "scoped",
    });

    services.set("AnnoucementService", {
      factory: (scope) => new Services.AnnoucementService(scope.resolve("CacheService")),
      lifetime: "scoped",
    });

    services.set("DiscussionService", {
      factory: (scope) => new Services.DiscussionService(scope.resolve("CacheService")),
      lifetime: "scoped",
    });

    services.set("GradeService", {
      factory: (scope) =>
        new Services.GradeService(
          scope.resolve("GradeRepository"),
          scope.resolve("CacheService"),
          scope.resolve("CourseService"),
          scope.resolve("UserService")
        ),
      lifetime: "scoped",
    });

    services.set("ReviewService", {
      factory: (scope) => new Services.ReviewService(scope.resolve("CacheService")),
      lifetime: "scoped",
    });

    services.set("AppointmentService", {
      factory: (scope) => new Services.AppointmentService(scope.resolve("CacheService")),
      lifetime: "scoped",
    });

    services.set("TutorService", {
      factory: (scope) => new Services.TutorService(scope.resolve("CacheService")),
      lifetime: "scoped",
    });

    services.set("OfficeService", {
      factory: (scope) => new Services.OfficeService(scope.resolve("CacheService")),
      lifetime: "scoped",
    });

    services.set("BookingService", {
      factory: (scope) => new Services.BookingService(scope.resolve("CacheService")),
      lifetime: "scoped",
    });

    services.set("UserService", {
      factory: (scope) =>
        new Services.UserService(
          scope.resolve("UserRepository"),
          scope.resolveOptional("TokenService"),
          scope.resolveOptional("FileService")
        ),
      lifetime: "scoped",
    });

    services.set("AssignmentService", {
      factory: (scope) =>
        new Services.AssignmentService(
          scope.resolve("CacheService"),
          scope.resolve("FileService")
        ),
      lifetime: "scoped",
    });

    services.set("LectureService", {
      factory: (scope) =>
        new Services.LectureService(
          scope.resolve("CacheService"),
          scope.resolve("FileService")
        ),
      lifetime: "scoped",
    });

    services.set("CourseService", {
      factory: (scope) =>
        new Services.CourseService(
          scope.resolve("CourseRepository"),
          scope.resolve("CacheService"),
          scope.resolve("UserService"),
          scope.resolve("CatalogueService"),
          scope.resolve("FileService")
        ),
      lifetime: "scoped",
    });

    services.set("EnrollmentService", {
      factory: (scope) =>
        new Services.EnrollmentService(
          scope.resolve("UserService"),
          scope.resolve("CourseService")
        ),
      lifetime: "scoped",
    });

    services.set("AuthService", {
      factory: (scope) =>
        new Services.AuthService(
          scope.resolve("UserRepository"),
          scope.resolve("EmailQueue"),
          scope.resolve("TokenService"),
          scope.resolve("OAuthService"),
          scope.resolve("WebService")
        ),
      lifetime: "scoped",
    });

    return services;
  } catch (err: any) {
    logger.error(
      `[Container] Services registration failed: ${err?.message ?? err}`
    );
    process.exit(1);
  }
}

export { registerServiceModules };
