import { AssignmentController } from "../controller/assignmentController";
import { AuthController } from "../controller/authController";
import { CatalogueController } from "../controller/catalogueController";
import { CourseController } from "../controller/courseController";
import { EnrollmentController } from "../controller/enrollmentController";
import { FileController } from "../controller/fileController";
import { GradeController } from "../controller/gradeController";
import { UserController } from "../controller/userController";
import { ContactController } from "../controller/contactController";

export const ControllerTypes = {
  AuthController,
  UserController,
  GradeController,
  FileController,
  CourseController,
  EnrollmentController,
  CatalogueController,
  AssignmentController,
  ContactController
};

export type ControllerKey = keyof typeof ControllerTypes;
export type ControllerInstance<K extends ControllerKey> = InstanceType<
  (typeof ControllerTypes)[K]
>;
