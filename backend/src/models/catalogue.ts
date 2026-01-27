import { Prisma } from "../generated/prisma/client";

export const CatalogueMiniSelect = {
  id: true,
  courseName: true,
  courseCode: true,
} satisfies Prisma.CatalogueSelect;

export type CatalogueMini = Prisma.CatalogueGetPayload<{
  select: typeof CatalogueMiniSelect;
}>;

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
