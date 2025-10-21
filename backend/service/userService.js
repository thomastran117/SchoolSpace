import prisma from "../resource/prisma.js";
import { httpError } from "../utility/httpUtility.js";
import { generateTokens, logoutToken } from "./tokenService.js";
import { uploadFile, deleteFile } from "./fileService.js";

const update_avatar = async (id, image, token) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) throw httpError(404, "User not found");

  // Fix deletion for duplicates!
  const { fileName, filePath, publicUrl } = await uploadFile(
    image.buffer,
    image.originalname,
    "profile",
  );

  /*
  if (user.avatar) {
    await deleteFile("profile", user.avatar);
  }
  */

  const updated = await prisma.user.update({
    where: { id },
    data: {
      avatar: publicUrl,
      updatedAt: new Date(),
    },
  });

  const { accessToken, refreshToken } = await generateTokens(
    updated.id,
    updated.username || updated.email,
    updated.role,
    updated.avatar,
    true,
  );

  await logoutToken(token);

  return {
    accessToken,
    refreshToken,
    role: updated.role,
    id: updated.id,
    username: updated.username,
    avatar: updated.avatar,
  };
};

const update_role = async (id, role, token) => {
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
      updatedAt: new Date(),
    },
  });

  const { accessToken, refreshToken } = await generateTokens(
    updated.id,
    updated.username || updated.email,
    updated.role,
    updated.avatar,
    true,
  );

  await logoutToken(token);

  return {
    accessToken,
    refreshToken,
    role: updated.role,
    id: updated.id,
    username: updated.username,
    avatar: updated.avatar,
  };
};

const update_user = async (
  id,
  username,
  name,
  phone,
  address,
  faculty,
  school,
  token,
) => {
  if (username) {
    const existingUser = await prisma.user.findFirst({
      where: {
        username,
        NOT: { id },
      },
    });

    if (existingUser) {
      throw httpError(
        409,
        `A user with the username "${username}" already exists. Choose another username.`,
      );
    }
  }

  const data = Object.fromEntries(
    Object.entries({
      username,
      name,
      phone,
      address,
      faculty,
      school,
      updatedAt: new Date(),
    }).filter(([_, v]) => v !== undefined && v !== null),
  );

  const updated = await prisma.user.update({
    where: { id },
    data,
  });

  const { accessToken, refreshToken } = await generateTokens(
    updated.id,
    updated.username || updated.email,
    updated.role,
    updated.avatar,
    true,
  );

  await logoutToken(token);

  return {
    accessToken,
    refreshToken,
    role: updated.role,
    id: updated.id,
    username: updated.username,
    avatar: updated.avatar,
  };
};

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
