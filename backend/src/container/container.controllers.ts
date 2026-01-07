import * as Controllers from "../controller";
import logger from "../utility/logger";
import type { Registration } from "./container.types";

function registerControllerModules(): Map<string, Registration<any>> {
  try {
    const controllers = new Map<string, Registration<any>>();

    controllers.set("AuthController", {
      factory: (scope) =>
        new Controllers.AuthController({
          authService: scope.resolve("AuthService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("FileController", {
      factory: (scope) =>
        new Controllers.FileController({
          fileService: scope.resolve("FileService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("UserController", {
      factory: (scope) =>
        new Controllers.UserController({
          userService: scope.resolve("UserService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("CatalogueController", {
      factory: (scope) =>
        new Controllers.CatalogueController({
          catalogueService: scope.resolve("CatalogueService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("CourseController", {
      factory: (scope) =>
        new Controllers.CourseController({
          courseService: scope.resolve("CourseService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("AnnouncementController", {
      factory: (scope) =>
        new Controllers.AnnouncementController({
          annoucementService: scope.resolve("AnnoucementService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("AssignmentController", {
      factory: (scope) =>
        new Controllers.AssignmentController({
          assignmentService: scope.resolve("AssignmentService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("DiscussionController", {
      factory: (scope) =>
        new Controllers.DiscussionController({
          discussionService: scope.resolve("DiscussionService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("EnrollmentController", {
      factory: (scope) =>
        new Controllers.EnrollmentController({
          enrollmentService: scope.resolve("EnrollmentService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("GradeController", {
      factory: (scope) =>
        new Controllers.GradeController({
          gradeService: scope.resolve("GradeService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("LectureController", {
      factory: (scope) =>
        new Controllers.LectureController({
          lectureService: scope.resolve("LectureService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("ReviewController", {
      factory: (scope) =>
        new Controllers.ReviewController({
          reviewService: scope.resolve("ReviewService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("SubmissionController", {
      factory: (scope) =>
        new Controllers.SubmissionController({
          submissionService: scope.resolve("SubmissionService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("BookingController", {
      factory: (scope) =>
        new Controllers.BookingController({
          bookingService: scope.resolve("BookingService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("AppointmentController", {
      factory: (scope) =>
        new Controllers.AppointmentController({
          appointmentService: scope.resolve("AppointmentService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("TutorController", {
      factory: (scope) =>
        new Controllers.TutorController({
          tutorService: scope.resolve("TutorService"),
        }),
      lifetime: "scoped",
    });

    controllers.set("OfficeController", {
      factory: (scope) =>
        new Controllers.OfficeController({
          officeService: scope.resolve("OfficeService"),
        }),
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
