type Term = "WINTER" | "FALL" | "SUMMER";

type Catalogue = {
  id: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  courseName: string;
  available: boolean;
  courseCode: string;
  term: Term;
};

export type { Catalogue, Term };
