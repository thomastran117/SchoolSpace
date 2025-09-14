const {
  add_course,
  update_course,
  delete_course,
  get_course,
  get_courses,
  get_courses_by_student,
  get_courses_by_teacher,
} = require("../service/courseService");
const {
  requireFields,
  requiresAtLeastOneField,
  httpError,
  validatePositiveInt,
} = require("../utility/httpUtility");

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
    res.status(201).json({ message: "Course deleted successfully" });
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
    httpError(501, "Not implemented yet");
  } catch (err) {
    next(err);
  }
};

const getCourses = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    httpError(501, "Not implemented yet");
  } catch (err) {
    next(err);
  }
};

const getCoursesByTeacher = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    httpError(501, "Not implemented yet");
  } catch (err) {
    next(err);
  }
};

const getCoursesByStudent = async (req, res, next) => {
  try {
    const { id: userId, role } = req.user;
    httpError(501, "Not implemented yet");
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCourse,
  getCourses,
  deleteCourse,
  updateCourse,
  addCourse,
  getCoursesByStudent,
  getCoursesByTeacher,
};
