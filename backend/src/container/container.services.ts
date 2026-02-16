/**
 * @file container.services.ts
 * @description
 * Factory methods to create service objects
 *
 * @module container
 * @version 1.0.0
 * @auth Thomas
 */
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
      factory: (scope) =>
        new Services.TokenService({
          cacheService: scope.resolve("CacheService"),
        }),
      lifetime: "transient",
    });

    services.set("CodeService", {
      factory: (scope) =>
        new Services.CodeService({
          cacheService: scope.resolve("CacheService"),
        }),
      lifetime: "transient",
    });

    services.set("PaymentService", {
      factory: (scope) =>
        new Services.PaymentService({
          webService: scope.resolve("WebService"),
        }),
      lifetime: "scoped",
    });

    services.set("CatalogueService", {
      factory: (scope) =>
        new Services.CatalogueService({
          cacheService: scope.resolve("CacheService"),
          catalogueRepository: scope.resolve("CatalogueRepository"),
        }),
      lifetime: "scoped",
    });

    services.set("GradeService", {
      factory: (scope) =>
        new Services.GradeService({
          gradeRepository: scope.resolve("GradeRepository"),
          cacheService: scope.resolve("CacheService"),
          courseService: scope.resolve("CourseService"),
          userService: scope.resolve("UserService"),
        }),
      lifetime: "scoped",
    });

    services.set("UserService", {
      factory: (scope) =>
        new Services.UserService({
          userRepository: scope.resolve("UserRepository"),
          cacheService: scope.resolve("CacheService"),
          tokenService: scope.resolveOptional("TokenService"),
          fileService: scope.resolveOptional("FileService"),
        }),
      lifetime: "scoped",
    });

    services.set("AssignmentService", {
      factory: (scope) =>
        new Services.AssignmentService({
          cacheService: scope.resolve("CacheService"),
          fileService: scope.resolve("FileService"),
        }),
      lifetime: "scoped",
    });

    services.set("CourseService", {
      factory: (scope) =>
        new Services.CourseService({
          courseRepository: scope.resolve("CourseRepository"),
          cacheService: scope.resolve("CacheService"),
          userService: scope.resolve("UserService"),
          catalogueService: scope.resolve("CatalogueService"),
          fileService: scope.resolve("FileService"),
        }),
      lifetime: "scoped",
    });

    services.set("AuthService", {
      factory: (scope) =>
        new Services.AuthService({
          userRepository: scope.resolve("UserRepository"),
          emailQueue: scope.resolve("EmailQueue"),
          tokenService: scope.resolve("TokenService"),
          oauthService: scope.resolve("OAuthService"),
          webService: scope.resolve("WebService"),
        }),
      lifetime: "scoped",
    });

    services.set("ContactService", {
      factory: (scope) =>
        new Services.ContactService({
          contactRepository: scope.resolve("ContactRepository"),
          webService: scope.resolve("WebService"),
        }),
      lifetime: "scoped",
    });

    services.set("EnrollmentService", {
      factory: (scope) =>
        new Services.EnrollmentService({
          enrollmentRepository: scope.resolve("EnrollmentRepository"),
          codeService: scope.resolve("CodeService"),
        }),
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
