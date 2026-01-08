import * as Controllers from "../controller";
import logger from "../utility/logger";
import type { Registration } from "./container.types";

function registerControllerModules(): Map<string, Registration<any>> {
  try {
    const controllers = new Map<string, Registration<any>>();

    controllers.set("AuthController", {
      factory: (scope) =>
<<<<<<< HEAD
        new Controllers.AuthController(scope.resolve("AuthService")),
=======
        new Controllers.AuthController({
          authService: scope.resolve("AuthService"),
        }),
>>>>>>> main
      lifetime: "scoped",
    });

    controllers.set("FileController", {
      factory: (scope) =>
<<<<<<< HEAD
        new Controllers.FileController(scope.resolve("FileService")),
=======
        new Controllers.FileController({
          fileService: scope.resolve("FileService"),
        }),
>>>>>>> main
      lifetime: "scoped",
    });

    controllers.set("UserController", {
      factory: (scope) =>
<<<<<<< HEAD
        new Controllers.UserController(scope.resolve("UserService")),
=======
        new Controllers.UserController({
          userService: scope.resolve("UserService"),
        }),
>>>>>>> main
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
<<<<<<< HEAD
      factory: (scope) =>
        new Controllers.CourseController(scope.resolve("CourseService")),
=======
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
>>>>>>> main
      lifetime: "scoped",
    });

    controllers.set("AssignmentController", {
      factory: (scope) =>
<<<<<<< HEAD
        new Controllers.AssignmentController(
          scope.resolve("AssignmentService")
        ),
=======
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
>>>>>>> main
      lifetime: "scoped",
    });

    controllers.set("EnrollmentController", {
      factory: (scope) =>
<<<<<<< HEAD
        new Controllers.EnrollmentController(
          scope.resolve("EnrollmentService")
        ),
=======
        new Controllers.EnrollmentController({
          enrollmentService: scope.resolve("EnrollmentService"),
        }),
>>>>>>> main
      lifetime: "scoped",
    });

    controllers.set("GradeController", {
<<<<<<< HEAD
      factory: (scope) =>
        new Controllers.GradeController(scope.resolve("GradeService")),
      lifetime: "scoped",
    });

=======
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
>>>>>>> main
    return controllers;
  } catch (err: any) {
    logger.error(
      `[Container] Controllers registration failed: ${err?.message ?? err}`
    );
    process.exit(1);
  }
}

export { registerControllerModules };
