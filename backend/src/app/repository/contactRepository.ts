/**
 * @file contactRepository.ts
 * @description
 * Database methods for the contactRequest model
 *
 * @module repository
 * @version 1.0.0
 * @auth Thomas
 */
import type { ContactRequest } from "@models/contact";
import { BaseRepository } from "@repository/baseRepository";

class ContactRepository extends BaseRepository {
  constructor() {
    super({ maxRetries: 3, baseDelay: 150 });
  }

  public async create(data: {
    email: string;
    topic: string;
    message: string;
  }): Promise<ContactRequest> {
    return this.executeAsync(
      () =>
        this.prisma.contactRequest.create({
          data: {
            ...data,
          },
        }),
      { deadlineMs: 1000 }
    );
  }

  public async findById(id: number): Promise<ContactRequest | null> {
    return this.executeAsync(
      () => this.prisma.contactRequest.findUnique({ where: { id } }),
      {
        deadlineMs: 800,
      }
    );
  }

  public async findByIds(ids: number[]): Promise<ContactRequest[]> {
    if (!ids.length) return [];

    return this.executeAsync(
      () =>
        this.prisma.contactRequest.findMany({
          where: { id: { in: ids } },
        }),
      { deadlineMs: 1200 }
    );
  }

  public async findAll(
    options: {
      page?: number;
      limit?: number;
    } = {}
  ) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    return this.executeAsync(
      async () => {
        const [results, total] = await Promise.all([
          this.prisma.contactRequest.findMany({
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
          }),
          this.prisma.grade.count(),
        ]);

        return { results, total };
      },
      { deadlineMs: 1200 }
    );
  }

  public async updateById(
    id: number,
    update: Partial<ContactRequest>
  ): Promise<ContactRequest | null> {
    return this.executeAsync(
      async () => {
        try {
          return await this.prisma.contactRequest.update({
            where: { id },
            data: update,
          });
        } catch {
          return null;
        }
      },
      { deadlineMs: 800 }
    );
  }

  public async delete(id: number): Promise<boolean> {
    return this.executeAsync(
      async () => {
        const res = await this.prisma.contactRequest.delete({ where: { id } });
        return true;
      },
      { deadlineMs: 800 }
    );
  }
}

export { ContactRepository };
export default ContactRepository;
