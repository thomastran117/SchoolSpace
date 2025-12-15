import { AnnoucementService } from "../service/annoucementService";
import { AppointmentService } from "../service/appointmentService";
import { AssignmentService } from "../service/assignmentService";
import { AuthService } from "../service/authService";
import { BasicTokenService } from "../service/basicTokenService";
import { BookingService } from "../service/bookingService";
import { CacheService } from "../service/cacheService";
import { CatalogueService } from "../service/catalogueService";
import { CourseService } from "../service/courseService";
import { DiscussionService } from "../service/discussionService";
import { EnrollmentService } from "../service/enrollmentService";
import { FileService } from "../service/fileService";
import { GradeService } from "../service/gradeService";
import { LectureService } from "../service/lectureService";
import { OAuthService } from "../service/oauthService";
import { OfficeService } from "../service/officeService";
import { PaymentService } from "../service/paymentService";
import { ReviewService } from "../service/reviewService";
import { SubmissionService } from "../service/submissionService";
import { TokenService } from "../service/tokenService";
import { TutorService } from "../service/tutorService";
import { UserService } from "../service/userService";
import { WebService } from "../service/webService";

import type { Registration } from "./container.types";

import logger from "../utility/logger";

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
      factory: (scope) => new TokenService(scope.resolve("CacheService")),
      lifetime: "transient",
    });

    services.set("PaymentService", {
      factory: (scope) => new PaymentService(scope.resolve("WebService")),
      lifetime: "scoped",
    });

    services.set("SubmissionService", {
      factory: (scope) => new SubmissionService(scope.resolve("FileService")),
      lifetime: "scoped",
    });

    services.set("CatalogueService", {
      factory: (scope) =>
        new CatalogueService(
          scope.resolve("CacheService"),
          scope.resolve("CatalogueRepository"),
        ),
      lifetime: "scoped",
    });

    services.set("AnnoucementService", {
      factory: (scope) => new AnnoucementService(scope.resolve("CacheService")),
      lifetime: "scoped",
    });

    services.set("DiscussionService", {
      factory: (scope) => new DiscussionService(scope.resolve("CacheService")),
      lifetime: "scoped",
    });

    services.set("GradeService", {
      factory: (scope) => new GradeService(scope.resolve("CacheService")),
      lifetime: "scoped",
    });

    services.set("ReviewService", {
      factory: (scope) => new ReviewService(scope.resolve("CacheService")),
      lifetime: "scoped",
    });

    services.set("AppointmentService", {
      factory: (scope) => new AppointmentService(scope.resolve("CacheService")),
      lifetime: "scoped",
    });

    services.set("TutorService", {
      factory: (scope) => new TutorService(scope.resolve("CacheService")),
      lifetime: "scoped",
    });

    services.set("OfficeService", {
      factory: (scope) => new OfficeService(scope.resolve("CacheService")),
      lifetime: "scoped",
    });

    services.set("BookingService", {
      factory: (scope) => new BookingService(scope.resolve("CacheService")),
      lifetime: "scoped",
    });

    services.set("UserService", {
      factory: (scope) =>
        new UserService(
          scope.resolve("UserRepository"),
          scope.resolveOptional("TokenService"),
          scope.resolveOptional("FileServices"),
        ),
      lifetime: "scoped",
    });

    services.set("AssignmentService", {
      factory: (scope) =>
        new AssignmentService(
          scope.resolve("CacheService"),
          scope.resolve("FileService"),
        ),
      lifetime: "scoped",
    });

    services.set("LectureService", {
      factory: (scope) =>
        new LectureService(
          scope.resolve("CacheService"),
          scope.resolve("FileService"),
        ),
      lifetime: "scoped",
    });

    services.set("CourseService", {
      factory: (scope) =>
        new CourseService(
          scope.resolve("CourseRepository"),
          scope.resolve("CacheService"),
          scope.resolve("UserService"),
          scope.resolve("CatalogueService"),
          scope.resolve("FileService"),
        ),
      lifetime: "scoped",
    });

    services.set("EnrollmentService", {
      factory: (scope) =>
        new EnrollmentService(
          scope.resolve("UserService"),
          scope.resolve("CourseService"),
        ),
      lifetime: "scoped",
    });

    services.set("AuthService", {
      factory: (scope) =>
        new AuthService(
          scope.resolve("UserRepository"),
          scope.resolve("EmailQueue"),
          scope.resolve("TokenService"),
          scope.resolve("OAuthService"),
          scope.resolve("WebService"),
        ),
      lifetime: "scoped",
    });

    return services;
  } catch (err: any) {
    logger.error(
      `[Container] Services registration failed: ${err?.message ?? err}`,
    );
    process.exit(1);
  }
}

export { registerServiceModules };
