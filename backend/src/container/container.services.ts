/**
 * @file container.services.ts
 * @description
 * Factory methods to create service objects
 *
 * @module container
 * @version 1.0.0
 * @auth Thomas
 */
import type { Registration } from "@container/container.types";
import { AssignmentService } from "@service/assignmentService";
import { AuthService } from "@service/authService";
import { BasicTokenService } from "@service/basicTokenService";
import { CacheService } from "@service/cacheService";
import { CatalogueService } from "@service/catalogueService";
import { CodeService } from "@service/codeService";
import { ContactService } from "@service/contactService";
import { CourseService } from "@service/courseService";
import { EnrollmentService } from "@service/enrollmentService";
import { FileService } from "@service/fileService";
import { GradeService } from "@service/gradeService";
import { OAuthService } from "@service/oauthService";
import { PaymentService } from "@service/paymentService";
import { TokenService } from "@service/tokenService";
import { UserService } from "@service/userService";
import { WebService } from "@service/webService";
import logger from "@utility/logger";

function registerServiceModules(): Map<string, Registration<any>> {
  try {
    const services = new Map<string, Registration<any>>();

    services.set("CacheService", {
      factory: () => new CacheService(),
      lifetime: "singleton",
    });

    services.set("FileService", {
      factory: () => new FileService(),
      lifetime: "singleton",
    });

    services.set("BasicTokenService", {
      factory: () => new BasicTokenService(),
      lifetime: "singleton",
    });

    services.set("WebService", {
      factory: () => new WebService(),
      lifetime: "transient",
    });

    services.set("OAuthService", {
      factory: () => new OAuthService(),
      lifetime: "transient",
    });

    services.set("TokenService", {
      factory: (scope) =>
        new TokenService({
          cacheService: scope.resolve("CacheService"),
        }),
      lifetime: "transient",
    });

    services.set("CodeService", {
      factory: (scope) =>
        new CodeService({
          cacheService: scope.resolve("CacheService"),
        }),
      lifetime: "transient",
    });

    services.set("PaymentService", {
      factory: (scope) =>
        new PaymentService({
          webService: scope.resolve("WebService"),
        }),
      lifetime: "scoped",
    });

    services.set("CatalogueService", {
      factory: (scope) =>
        new CatalogueService({
          cacheService: scope.resolve("CacheService"),
          catalogueRepository: scope.resolve("CatalogueRepository"),
        }),
      lifetime: "scoped",
    });

    services.set("GradeService", {
      factory: (scope) =>
        new GradeService({
          gradeRepository: scope.resolve("GradeRepository"),
          cacheService: scope.resolve("CacheService"),
          courseService: scope.resolve("CourseService"),
          userService: scope.resolve("UserService"),
        }),
      lifetime: "scoped",
    });

    services.set("UserService", {
      factory: (scope) =>
        new UserService({
          userRepository: scope.resolve("UserRepository"),
          cacheService: scope.resolve("CacheService"),
          tokenService: scope.resolveOptional("TokenService"),
          fileService: scope.resolveOptional("FileService"),
        }),
      lifetime: "scoped",
    });

    services.set("AssignmentService", {
      factory: (scope) =>
        new AssignmentService({
          cacheService: scope.resolve("CacheService"),
          fileService: scope.resolve("FileService"),
        }),
      lifetime: "scoped",
    });

    services.set("CourseService", {
      factory: (scope) =>
        new CourseService({
          courseRepository: scope.resolve("CourseRepository"),
          enrollmentService: scope.resolve("EnrollmentService"),
          cacheService: scope.resolve("CacheService"),
          userService: scope.resolve("UserService"),
          catalogueService: scope.resolve("CatalogueService"),
          fileService: scope.resolve("FileService"),
        }),
      lifetime: "scoped",
    });

    services.set("AuthService", {
      factory: (scope) =>
        new AuthService({
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
        new ContactService({
          contactRepository: scope.resolve("ContactRepository"),
          webService: scope.resolve("WebService"),
        }),
      lifetime: "scoped",
    });

    services.set("EnrollmentService", {
      factory: (scope) =>
        new EnrollmentService({
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
