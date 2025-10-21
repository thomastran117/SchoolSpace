import {
  add_course,
  update_course,
  delete_course,
  get_course,
  get_courses,
  get_courses_by_student,
  get_courses_by_teacher,
} from "../service/courseService.js";
import {
  requireFields,
  requiresAtLeastOneField,
  httpError,
} from "../utility/httpUtility.js";
import { validatePositiveInt } from "../utility/validateUtility.js";
import logger from "../utility/logger.js";

const addCourse = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    if (role !== "teacher")
      httpError(403, "The user lacks permissions to add courses");
    requireFields(["title", "description", "code"], req.body);
    const { title, description, code } = req.body;
    const course = await add_course(userId, title, description, code);
    res
      .status(201)
      .json({ message: "Course creation successful", course: course });
  } catch (err) {
    next(err);
  }
};

const updateCourse = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    if (role !== "teacher")
      httpError(403, "The user lacks permissions to update this course");
    requiresAtLeastOneField(["title", "description", "code"], req.body);
    const { title, description, code } = req.body;
    const courseId = validatePositiveInt(req.params.id, "courseId");
    const course = await update_course(
      courseId,
      userId,
      title,
      description,
      code,
    );
    res
      .status(201)
      .json({ message: "Course updated successfully", course: course });
  } catch (err) {
    next(err);
  }
};

const deleteCourse = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    if (role !== "teacher")
      httpError(403, "The user lacks permissions to update this course");
    const courseId = validatePositiveInt(req.params.id, "courseId");
    await delete_course(courseId, userId);
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (err) {
    next(err);
  }
};

const getCourse = async (req, res, next) => {
  try {
    const courseId = validatePositiveInt(req.params.id, "courseId");
    const course = await get_course(courseId);
    res
      .status(200)
      .json({ message: "Course fetched successfully", course: course });
  } catch (err) {
    next(err);
  }
};

const getCourses = async (req, res, next) => {
  try {
    const { id: authUserId, role } = req.user;

    const {
      search = "",
      ownerId,
      includeEnrollmentFor,
      limit = "20",
      cursor,
    } = req.query;

    const normalizedLimit = Math.min(
      Math.max(parseInt(limit, 10) || 20, 1),
      100,
    );

    const effectiveOwnerId =
      ownerId && role === "admin" ? ownerId : ownerId ? authUserId : undefined;

    const includeEnrollFor =
      includeEnrollmentFor === "me"
        ? authUserId
        : includeEnrollmentFor
          ? includeEnrollmentFor
          : undefined;

    const effectiveCursor = cursor ?? undefined;

    const { items, nextCursor } = await get_courses(
      search,
      effectiveOwnerId,
      includeEnrollFor,
      normalizedLimit,
      effectiveCursor,
    );

    res.status(200).json({
      message: "Courses fetched successfully",
      items,
      nextCursor,
      limit: normalizedLimit,
    });
  } catch (err) {
    next(err);
  }
};

const getCoursesByTeacher = async (req, res, next) => {
  try {
    const { id: authUserId, role } = req.user;

    if (role !== "teacher" && role !== "admin") {
      return httpError(
        403,
        "You must be a teacher or admin to view this endpoint",
      );
    }

    let targetId;

    if (role === "teacher") {
      targetId = authUserId;
    }

    if (role === "admin") {
      targetId = req.params.id;
    }

    const { limit = "20", cursor } = req.query;

    const normalizedLimit = Math.min(
      Math.max(parseInt(limit, 10) || 20, 1),
      100,
    );

    const effectiveCursor = cursor ?? undefined;

    const { items, nextCursor } = await get_courses_by_teacher(
      targetId,
      normalizedLimit,
      effectiveCursor,
    );

    res.status(200).json({
      message: "Courses fetched successfully",
      items,
      nextCursor,
      limit: normalizedLimit,
    });
  } catch (err) {
    next(err);
  }
};

const getCoursesByStudent = async (req, res, next) => {
  try {
    const { id: authUserId, role } = req.user;

    if (role !== "student" && role !== "admin") {
      return httpError(
        403,
        "You must be a student or admin to view this endpoint",
      );
    }

    let targetId;

    if (role === "student") {
      targetId = authUserId;
    }

    if (role === "admin") {
      targetId = req.params.id;
    }

    const { limit = "20", cursor } = req.query;

    const normalizedLimit = Math.min(
      Math.max(parseInt(limit, 10) || 20, 1),
      100,
    );

    const effectiveCursor = cursor ?? undefined;

    const { items, nextCursor } = await get_courses_by_student(
      authUserId,
      normalizedLimit,
      effectiveCursor,
    );

    res.status(200).json({
      message: "Courses fetched successfully",
      items,
      nextCursor,
      limit: normalizedLimit,
    });
  } catch (err) {
    next(err);
  }
};

export {
  getCourse,
  getCourses,
  deleteCourse,
  updateCourse,
  addCourse,
  getCoursesByStudent,
  getCoursesByTeacher,
};
