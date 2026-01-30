/**
 * @file catalogue.ts
 * @description
 * Catalogue related models
 *
 * @module models
 * @version 1.0.0
 * @auth Thomas
 */
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
