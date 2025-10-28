import { httpError } from "../src/utility/httpUtility.js";
import { validatePositiveInt } from "../src/utility/validateUtility.js";
import {
  enroll_in_course,
  unenroll_in_course,
} from "../src/service/enrollService.js";

function resolveStudentId(req) {
  const { id: authUserId, role } = req.user;

  if (role === "student") {
    return authUserId;
  }

  if (role === "teacher" || role === "admin") {
    const studentId = req.query.id;
    if (!studentId) {
      httpError(400, "Missing id query for target student");
    }
    return validatePositiveInt(studentId, "studentId");
  }

  httpError(403, "You lack permissions to perform this action");
}

const enrollInCourse = async (req, res, next) => {
  try {
    const courseId = validatePositiveInt(req.params.id, "courseId");
    const studentId = resolveStudentId(req);

    const enrollment = await enroll_in_course(studentId, courseId);
    res.status(201).json({ message: "Enrollment successful", enrollment });
  } catch (err) {
    next(err);
  }
};

const unenrollInCourse = async (req, res, next) => {
  try {
    const courseId = validatePositiveInt(req.params.id, "courseId");
    const studentId = resolveStudentId(req);

    await unenroll_in_course(studentId, courseId);
    res.status(200).json({ message: "Unenrollment successful" });
  } catch (err) {
    next(err);
  }
};

export { enrollInCourse, unenrollInCourse };
