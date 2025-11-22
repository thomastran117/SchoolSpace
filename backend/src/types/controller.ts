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

export const ControllerTypes = {
  AuthController,
  UserController,
  TutorController,
  SubmissionController,
  ReviewController,
  OfficeController,
  PaymentController,
  LectureController,
  GradeController,
  FileController,
  CourseController,
  EnrollmentController,
  DiscussionController,
  BookingController,
  CatalogueController,
  AssignmentController,
  AppointmentController,
  AnnouncementController,
};

export type ControllerKey = keyof typeof ControllerTypes;

export type ControllerInstance<K extends ControllerKey> = InstanceType<
  (typeof ControllerTypes)[K]
>;
