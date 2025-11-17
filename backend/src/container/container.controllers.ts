import { AuthController } from "../controller/authController";
import { PaymentController } from "../controller/paymentController";
import { FileController } from "../controller/fileController";
import { UserController } from "../controller/userController";
import { CatalogueController } from "../controller/catalogueController";
import { CourseController } from "../controller/courseController";
import { AnnouncementController } from "../controller/announcementController";
import { AssignmentController } from "../controller/assignmentController";
import { DiscussionController } from "../controller/discussionController";
import { EnrollmentController } from "../controller/enrollmentController";
import { GradeController } from "../controller/gradeController";
import { LectureController } from "../controller/lectureController";
import { ReviewController } from "../controller/reviewController";
import { SubmissionController } from "../controller/submissionController";
import { AppointmentController } from "../controller/appointmentController";
import { BookingController } from "../controller/bookingController";
import { OfficeController } from "../controller/officeController";
import { TutorController } from "../controller/tutorController";

import type { Registration } from "./container.types";

import logger from "../utility/logger";

function registerControllerModules(): Map<string, Registration<any>> {
  try {
    const controllers = new Map<string, Registration<any>>();

    controllers.set("AuthController", {
      factory: (scope) => new AuthController(scope.resolve("AuthService")),
      lifetime: "transient",
    });

    controllers.set("PaymentController", {
      factory: (scope) =>
        new PaymentController(scope.resolve("PaymentService")),
      lifetime: "transient",
    });

    controllers.set("FileController", {
      factory: (scope) => new FileController(scope.resolve("FileService")),
      lifetime: "transient",
    });

    controllers.set("UserController", {
      factory: (scope) => new UserController(scope.resolve("UserService")),
      lifetime: "transient",
    });

    controllers.set("CatalogueController", {
      factory: (scope) =>
        new CatalogueController(scope.resolve("CatalogueService")),
      lifetime: "transient",
    });

    controllers.set("CourseController", {
      factory: (scope) => new CourseController(scope.resolve("CourseService")),
      lifetime: "transient",
    });

    controllers.set("AnnouncementController", {
      factory: (scope) =>
        new AnnouncementController(scope.resolve("AnnoucementService")),
      lifetime: "transient",
    });

    controllers.set("AssignmentController", {
      factory: (scope) =>
        new AssignmentController(scope.resolve("AssignmentService")),
      lifetime: "transient",
    });

    controllers.set("DiscussionController", {
      factory: (scope) =>
        new DiscussionController(scope.resolve("DiscussionService")),
      lifetime: "transient",
    });

    controllers.set("EnrollmentController", {
      factory: (scope) =>
        new EnrollmentController(scope.resolve("EnrollmentService")),
      lifetime: "transient",
    });

    controllers.set("GradeController", {
      factory: (scope) => new GradeController(scope.resolve("GradeService")),
      lifetime: "transient",
    });

    controllers.set("LectureController", {
      factory: (scope) =>
        new LectureController(scope.resolve("LectureService")),
      lifetime: "transient",
    });

    controllers.set("ReviewController", {
      factory: (scope) => new ReviewController(scope.resolve("ReviewService")),
      lifetime: "transient",
    });

    controllers.set("SubmissionController", {
      factory: (scope) =>
        new SubmissionController(scope.resolve("SubmissionService")),
      lifetime: "transient",
    });

    controllers.set("BookingController", {
      factory: (scope) =>
        new BookingController(scope.resolve("BookingService")),
      lifetime: "transient",
    });

    controllers.set("AppointmentController", {
      factory: (scope) =>
        new AppointmentController(scope.resolve("AppointmentService")),
      lifetime: "transient",
    });

    controllers.set("TutorController", {
      factory: (scope) => new TutorController(scope.resolve("TutorService")),
      lifetime: "transient",
    });

    controllers.set("OfficeController", {
      factory: (scope) => new OfficeController(scope.resolve("OfficeService")),
      lifetime: "transient",
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
