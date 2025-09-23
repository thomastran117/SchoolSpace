import prisma from "../resource/prisma.js";
import { httpError } from "../utility/httpUtility.js";

const enroll_in_course = async (userId, courseId) => {
  if (!userId) throw httpError(400, "userId is required");
  if (!courseId) throw httpError(400, "courseId is required");

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true },
  });
  if (!course) throw httpError(404, "Course not found");

  try {
    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            ownerId: true,
            _count: { select: { enrollments: true } },
          },
        },
      },
    });

    return enrollment;
  } catch (e) {
    if (e.code === "P2002") {
      throw httpError(409, "Already enrolled in this course");
    }
    throw e;
  }
};

const unenroll_in_course = async (userId, courseId) => {
  if (!userId) throw httpError(400, "userId is required");
  if (!courseId) throw httpError(400, "courseId is required");

  try {
    await prisma.enrollment.delete({
      where: { userId_courseId: { userId, courseId } },
    });
    return { ok: true };
  } catch (e) {
    if (e.code === "P2025") {
      throw httpError(404, "Not enrolled in this course");
    }
    throw e;
  }
};

export { enroll_in_course, unenroll_in_course };
