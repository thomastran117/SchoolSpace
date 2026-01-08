type Course = {
    id: number;
    catalogueId: number;
    teacherId: number;
    imageUrl: string | null;
    year: number;
    createdAt: Date;
    updatedAt: Date;
}

export type { Course };
