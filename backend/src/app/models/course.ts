/**
 * @file course.ts
 * @description
 * Course related models
 *
 * @module models
 * @version 1.0.0
 * @auth Thomas
 */
import type { Prisma } from "@prisma/client";

export const courseListSelect = {
  id: true,
  section: true,
  catalogueId: true,
  teacherId: true,
  imageUrl: true,
  year: true,
  enrollmentNumber: true,
  maxEnrollmentNumber: true,

  catalogue: {
    select: {
      courseName: true,
      description: true,
      courseCode: true,
    },
  },
} satisfies Prisma.CourseSelect;

export type CourseListItem = Prisma.CourseGetPayload<{
  select: typeof courseListSelect;
}>;

export const courseFullInclude = {
  catalogue: true,
} satisfies Prisma.CourseInclude;

export type CourseFull = Prisma.CourseGetPayload<{
  include: typeof courseFullInclude;
}>;
