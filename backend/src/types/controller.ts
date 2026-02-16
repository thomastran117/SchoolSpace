import { AssignmentController } from "../controller/assignmentController";
import { AuthController } from "../controller/authController";
import { CatalogueController } from "../controller/catalogueController";
import { ContactController } from "../controller/contactController";
import { CourseController } from "../controller/courseController";
import { FileController } from "../controller/fileController";
import { GradeController } from "../controller/gradeController";
import { HealthController } from "../controller/healthController";
import { UserController } from "../controller/userController";

export const ControllerTypes = {
  AuthController,
  UserController,
  GradeController,
  FileController,
  CourseController,
  CatalogueController,
  AssignmentController,
  ContactController,
  HealthController,
};

export type ControllerKey = keyof typeof ControllerTypes;
export type ControllerInstance<K extends ControllerKey> = InstanceType<
  (typeof ControllerTypes)[K]
>;
