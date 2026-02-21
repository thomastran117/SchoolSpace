/**
 * @file container.services.ts
 * @description
 * Factory methods to create service objects
 *
 * @module container
 * @version 1.0.0
 * @auth Thomas
 */
import UserReportService from "@/service/userReportService";
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
      deps: [],
    });

    services.set("FileService", {
      factory: () => new FileService(),
      lifetime: "singleton",
      deps: [],
    });

    services.set("BasicTokenService", {
      factory: () => new BasicTokenService(),
      lifetime: "singleton",
      deps: [],
    });

    services.set("WebService", {
      factory: () => new WebService(),
      lifetime: "transient",
      deps: [],
    });

    services.set("OAuthService", {
      factory: () => new OAuthService(),
      lifetime: "transient",
      deps: [],
    });

    services.set("TokenService", {
      factory: (scope) =>
        new TokenService({
          cacheService: scope.resolve("CacheService"),
        }),
      lifetime: "transient",
      deps: [],
    });

    services.set("CodeService", {
      factory: (scope) =>
        new CodeService({
          cacheService: scope.resolve("CacheService"),
        }),
      lifetime: "transient",
      deps: ["CacheService"],
    });

    services.set("PaymentService", {
      factory: (scope) =>
        new PaymentService({
          webService: scope.resolve("WebService"),
        }),
      lifetime: "scoped",
      deps: ["WebService"],
    });

    services.set("CatalogueService", {
      factory: (scope) =>
        new CatalogueService({
          cacheService: scope.resolve("CacheService"),
          catalogueRepository: scope.resolve("CatalogueRepository"),
        }),
      lifetime: "scoped",
      deps: ["CacheService", "CatalogueRepository"],
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
      deps: ["GradeRepository", "CacheService"],
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
      deps: ["UserRepository", "CacheService", "TokenService", "FileService"],
    });

    services.set("AssignmentService", {
      factory: (scope) =>
        new AssignmentService({
          cacheService: scope.resolve("CacheService"),
          fileService: scope.resolve("FileService"),
        }),
      lifetime: "scoped",
      deps: ["FileService", "CacheService"],
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
      deps: [
        "CourseRepository",
        "CacheService",
        "UserService",
        "FileService",
        "EnrollmentService",
        "CatalogueService",
      ],
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
      deps: [
        "UserRepository",
        "EmailQueue",
        "TokenService",
        "OAuthService",
        "WebService",
      ],
    });

    services.set("ContactService", {
      factory: (scope) =>
        new ContactService({
          contactRepository: scope.resolve("ContactRepository"),
          webService: scope.resolve("WebService"),
        }),
      lifetime: "scoped",
      deps: ["ContactRepository", "WebService"],
    });

    services.set("EnrollmentService", {
      factory: (scope) =>
        new EnrollmentService({
          enrollmentRepository: scope.resolve("EnrollmentRepository"),
          codeService: scope.resolve("CodeService"),
        }),
      lifetime: "scoped",
      deps: ["EnrollmentRepository", "CodeService"],
    });

    services.set("EnrollmentService", {
      factory: (scope) =>
        new UserReportService({
          userReportRepository: scope.resolve("UserReportRepository"),
          cacheService: scope.resolve("CodeService"),
          webService: scope.resolve("WebService"),
          userService: scope.resolve("UserService"),
        }),
      lifetime: "scoped",
      deps: [
        "UserReportRepository",
        "WebService",
        "UserService",
        "CodeService",
      ],
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
