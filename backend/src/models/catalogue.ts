type Term = "WINTER" | "FALL" | "SUMMER";

type CatalogueCreateInput = {
  courseName: string;
  description: string;
  courseCode: string;
  term: Term;
  available?: boolean;
};

export type { CatalogueCreateInput };