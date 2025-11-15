import { CacheService } from "../service/cacheService";
import { EmailService } from "../service/emailService";
import { FileService } from "../service/fileService";
import { BasicTokenService, TokenService } from "../service/tokenService";
import { OAuthService } from "../service/oauthService";
import { PaymentService } from "../service/paymentService";
import { WebService } from "../service/webService";
import { AuthService } from "../service/authService";
import { UserService } from "../service/userService";
import { CatalogueService } from "../service/catalogueService";
import { CourseService } from "../service/courseService";
import { AnnoucementService } from "../service/annoucementService";
import { AssignmentService } from "../service/assignmentService";
import { DiscussionService } from "../service/discussionService";
import { EnrollmentService } from "../service/enrollmentService";
import { GradeService } from "../service/gradeService";
import { LectureService } from "../service/lectureService";
import { ReviewService } from "../service/reviewService";
import { SubmissionService } from "../service/submissionService";
import { AppointmentService } from "../service/appointmentService";
import { BookingService } from "../service/bookingService";
import { TutorService } from "../service/tutorService";
import { OfficeService } from "../service/officeService";

import type { Registration } from "./container.types";

export function registerServiceModules(): Map<string, Registration<any>> {
  const services = new Map<string, Registration<any>>();

  services.set("CacheService", {
    factory: () => new CacheService(),
    lifetime: "singleton",
  });
  services.set("EmailService", {
    factory: () => new EmailService(),
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
    lifetime: "scoped",
  });

  services.set("OAuthService", {
    factory: () => new OAuthService(),
    lifetime: "scoped",
  });

  services.set("EnrollmentService", {
    factory: () => new EnrollmentService(),
    lifetime: "scoped",
  });

  services.set("TokenService", {
    factory: (scope) => new TokenService(scope.resolve("CacheService")),
    lifetime: "scoped",
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
    factory: (scope) => new CatalogueService(scope.resolve("CacheService")),
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
        scope.resolve("TokenService"),
        scope.resolve("FileService"),
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
        scope.resolve("CacheService"),
        scope.resolve("FileService"),
      ),
    lifetime: "scoped",
  });

  services.set("AuthService", {
    factory: (scope) =>
      new AuthService(
        scope.resolve("EmailService"),
        scope.resolve("TokenService"),
        scope.resolve("OAuthService"),
        scope.resolve("WebService"),
      ),
    lifetime: "scoped",
  });

  return services;
}
