type Grade = {
  name: string;
  id: number;
  courseId: number;
  userId: number;
  weight: number;
  obtained: number;
  total: number;
  isFinalGrade: boolean;
  assignmentId: number | null;
  testId: string | null;
  quizId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type { Grade };
