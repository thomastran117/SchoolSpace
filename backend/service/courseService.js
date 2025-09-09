const prisma = require("../resource/prisma");
const { httpError } = require("../utility/httpUtility");

const add_course = async (ownerId, title, description) => {
  const course = await prisma.course.create({
    data: { title, description, ownerId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { enrollments: true } },
    },
  });
  return course;
};

const update_course = async (courseId, ownerId, title, description) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw httpError(404, "Course not found");
  if (course.ownerId !== ownerId) throw httpError(403, "Forbidden");

  const data = {};
  if (typeof title !== "undefined") data.title = title;
  if (typeof description !== "undefined") data.description = description;

  const updated = await prisma.course.update({
    where: { id: courseId },
    data,
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { enrollments: true } },
    },
  });
  return updated;
};

const delete_course = async (courseId, ownerId) => {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw httpError(404, "Course not found");
  if (course.ownerId !== ownerId) throw httpError(403, "Forbidden");

  await prisma.$transaction([
    prisma.enrollment.deleteMany({ where: { courseId } }),
    prisma.course.delete({ where: { id: courseId } }),
  ]);

  return { ok: true };
};

const get_course = async (courseId, requesterId) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) throw httpError(404, "Course not found");

  let isEnrolled = false;
  if (requesterId) {
    const enrollment = await prisma.enrollment.findFirst({
      where: { courseId, userId: requesterId },
      select: { id: true },
    });
    isEnrolled = !!enrollment;
  }

  return { ...course, isEnrolled };
};

const get_courses = async (
  search,
  ownerId,
  includeEnrollmentFor,
  limit = 20,
  cursor,
) => {
  const where = {};
  if (ownerId) where.ownerId = ownerId;
  if (search && search.trim()) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const query = {
    where,
    take: limit,
    orderBy: { id: "asc" },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { enrollments: true } },
    },
  };

  if (cursor) {
    query.cursor = { id: cursor };
    query.skip = 1;
  }

  const items = await prisma.course.findMany(query);

  if (includeEnrollmentFor && items.length) {
    const courseIds = items.map((c) => c.id);
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: includeEnrollmentFor, courseId: { in: courseIds } },
      select: { courseId: true },
    });
    const enrolledSet = new Set(enrollments.map((e) => e.courseId));
    for (const c of items) c.isEnrolled = enrolledSet.has(c.id);
  }

  const nextCursor = items.length === limit ? items[items.length - 1].id : null;
  return { items, nextCursor };
};

const get_courses_by_teacher = async (teacherId, limit = 20, cursor) => {
  const query = {
    where: { ownerId: teacherId },
    take: limit,
    orderBy: { id: "asc" },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { enrollments: true } },
    },
  };

  if (cursor) {
    query.cursor = { id: cursor };
    query.skip = 1;
  }

  const items = await prisma.course.findMany(query);
  const nextCursor = items.length === limit ? items[items.length - 1].id : null;
  return { items, nextCursor };
};

const get_courses_by_student = async (studentId, limit = 20, cursor) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId: studentId },
    take: limit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { id: "asc" },
    select: { id: true, courseId: true },
  });

  const courseIds = enrollments.map((e) => e.courseId);
  const courses = await prisma.course.findMany({
    where: { id: { in: courseIds } },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { enrollments: true } },
    },
  });

  const courseById = new Map(courses.map((c) => [c.id, c]));
  const items = enrollments.map((e) => ({
    enrollmentId: e.id,
    ...courseById.get(e.courseId),
    isEnrolled: true,
  }));

  const nextCursor =
    enrollments.length === limit
      ? enrollments[enrollments.length - 1].id
      : null;

  return { items, nextCursor };
};

module.exports = {
  get_course,
  get_courses,
  get_courses_by_student,
  get_courses_by_teacher,
  add_course,
  update_course,
  delete_course,
};
