import { AnnouncementController } from "../controller/announcementController";
import { AppointmentController } from "../controller/appointmentController";
import { AssignmentController } from "../controller/assignmentController";
import { AuthController } from "../controller/authController";
import { BookingController } from "../controller/bookingController";
import { CatalogueController } from "../controller/catalogueController";
import { CourseController } from "../controller/courseController";
import { DiscussionController } from "../controller/discussionController";
import { EnrollmentController } from "../controller/enrollmentController";
import { FileController } from "../controller/fileController";
import { GradeController } from "../controller/gradeController";
import { LectureController } from "../controller/lectureController";
import { OfficeController } from "../controller/officeController";
import { PaymentController } from "../controller/paymentController";
import { ReviewController } from "../controller/reviewController";
import { SubmissionController } from "../controller/submissionController";
import { TutorController } from "../controller/tutorController";
import { UserController } from "../controller/userController";

import type { Registration } from "./container.types";

import logger from "../utility/logger";

function registerControllerModules(): Map<string, Registration<any>> {
  try {
    const controllers = new Map<string, Registration<any>>();

    controllers.set("AuthController", {
      factory: (scope) => new AuthController(scope.resolve("AuthService")),
      lifetime: "scoped",
    });

    controllers.set("PaymentController", {
      factory: (scope) =>
        new PaymentController(scope.resolve("PaymentService")),
      lifetime: "scoped",
    });

    controllers.set("FileController", {
      factory: (scope) => new FileController(scope.resolve("FileService")),
      lifetime: "scoped",
    });

    controllers.set("UserController", {
      factory: (scope) => new UserController(scope.resolve("UserService")),
      lifetime: "scoped",
    });

    controllers.set("CatalogueController", {
      factory: (scope) =>
        new CatalogueController(scope.resolve("CatalogueService")),
      lifetime: "scoped",
    });

    controllers.set("CourseController", {
      factory: (scope) => new CourseController(scope.resolve("CourseService")),
      lifetime: "scoped",
    });

    controllers.set("AnnouncementController", {
      factory: (scope) =>
        new AnnouncementController(scope.resolve("AnnoucementService")),
      lifetime: "scoped",
    });

    controllers.set("AssignmentController", {
      factory: (scope) =>
        new AssignmentController(scope.resolve("AssignmentService")),
      lifetime: "scoped",
    });

    controllers.set("DiscussionController", {
      factory: (scope) =>
        new DiscussionController(scope.resolve("DiscussionService")),
      lifetime: "scoped",
    });

    controllers.set("EnrollmentController", {
      factory: (scope) =>
        new EnrollmentController(scope.resolve("EnrollmentService")),
      lifetime: "scoped",
    });

    controllers.set("GradeController", {
      factory: (scope) => new GradeController(scope.resolve("GradeService")),
      lifetime: "scoped",
    });

    controllers.set("LectureController", {
      factory: (scope) =>
        new LectureController(scope.resolve("LectureService")),
      lifetime: "scoped",
    });

    controllers.set("ReviewController", {
      factory: (scope) => new ReviewController(scope.resolve("ReviewService")),
      lifetime: "scoped",
    });

    controllers.set("SubmissionController", {
      factory: (scope) =>
        new SubmissionController(scope.resolve("SubmissionService")),
      lifetime: "scoped",
    });

    controllers.set("BookingController", {
      factory: (scope) =>
        new BookingController(scope.resolve("BookingService")),
      lifetime: "scoped",
    });

    controllers.set("AppointmentController", {
      factory: (scope) =>
        new AppointmentController(scope.resolve("AppointmentService")),
      lifetime: "scoped",
    });

    controllers.set("TutorController", {
      factory: (scope) => new TutorController(scope.resolve("TutorService")),
      lifetime: "scoped",
    });

    controllers.set("OfficeController", {
      factory: (scope) => new OfficeController(scope.resolve("OfficeService")),
      lifetime: "scoped",
    });
    return controllers;
  } catch (err: any) {
    logger.error(
      `[Container] Controllers registration failed: ${err?.message ?? err}`,
    );
    process.exit(1);
  }
}

export { registerControllerModules };
