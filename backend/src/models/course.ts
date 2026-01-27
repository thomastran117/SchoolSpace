type Course = {
  id: number;
  catalogueId: number;
  teacherId: number;
  imageUrl: string | null;
  year: number;
  createdAt: Date;
  updatedAt: Date;
  section: string;
  enrollmentNumber: number;
  maxEnrollmentNumber: number;
  assignmentNumber: number;
  annoucementNumber: number;
  assistantNumber: number;
  lectureNumber: number;
};

export type { Course };