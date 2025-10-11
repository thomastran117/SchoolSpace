import prisma from "../resource/prisma.js";
import { httpError } from "../utility/httpUtility.js";
import { generateTokens } from "./tokenService.js";
import { uploadFile } from "./fileService.js";

const update_avatar = async (id, image) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw httpError(404, "User not found");

  const { fileName, filePath, publicUrl } = await uploadFile(
    image.buffer,
    image.originalname,
    "profile",
  );

  const updated = await prisma.user.update({
    where: { id },
    data: {
      avatar: publicUrl,
    },
  });

  const { accessToken, refreshToken } = await generateTokens(
    updated.id,
    updated.username || updated.email,
    updated.role,
    updated.avatar,
    true,
  );

  return {
    accessToken,
    refreshToken,
    role: updated.role,
    id: updated.id,
    username: updated.username,
    avatar: updated.avatar,
  };
};

const update_role = async (id, role) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    httpError(404, "No user found");
  }

  if (user.role !== "undefined") {
    httpError(
      409,
      "The user role is set already. Contact support to change it",
    );
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      role,
    },
  });

  const { accessToken, refreshToken } = await generateTokens(
    updated.id,
    updated.username || updated.email,
    updated.role,
    updated.avatar,
    true,
  );

  return {
    accessToken,
    refreshToken,
    role: updated.role,
    id: updated.id,
    username: updated.username,
    avatar: updated.avatar,
  };
};

const update_user = async (id) => {};

const delete_user = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw httpError(404, "User not found");

  await prisma.course.delete({ where: { id } });

  return { ok: true };
};

const get_user = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw httpError(404, "User not found");
  return user;
};

const get_users = async () => {
  const users = await prisma.user.findMany();
  return users;
};

const get_students_by_course = async (courseId) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      enrollments: {
        include: { user: true },
      },
    },
  });

  if (!course) {
    throw httpError(404, "Course not found");
  }

  const students = course.enrollments
    .map((enrollment) => enrollment.user)
    .filter((user) => user.role === "student");

  return students;
};

const get_teacher_by_course = async (courseId) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      owner: true,
    },
  });

  if (!course) {
    throw httpError(404, "Course not found");
  }

  if (!course.owner || course.owner.role !== "teacher") {
    throw httpError(404, "Teacher not found for this course");
  }

  return course.owner;
};

export {
  get_user,
  get_users,
  get_students_by_course,
  get_teacher_by_course,
  update_user,
  update_role,
  update_avatar,
  delete_user,
};
