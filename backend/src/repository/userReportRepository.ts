import type { Status, Topic, UserReport } from "../models/userReport";
import { BaseRepository } from "./baseRepository";

class UserReportRepository extends BaseRepository {
  constructor() {
    super({ maxRetries: 3, baseDelay: 150 });
  }

  public async create(data: {
    victimUserId: number;
    offenderUserId: number;
    reportTopic: Topic;
    reportDescription?: string | null;
    reportStatus: Status;
  }): Promise<UserReport> {
    return this.executeAsync(
      async () => {
        return await this.prisma.userReport.create({ data });
      },
      { deadlineMs: 1000 }
    );
  }

  public async update(
    id: number,
    data: Partial<Omit<UserReport, "id" | "createdAt" | "updatedAt">>
  ): Promise<UserReport> {
    return this.executeAsync(
      async () => {
        const result = await this.prisma.userReport.update({
          where: { id },
          data: { ...data },
        });
        return result;
      },
      { deadlineMs: 1000 }
    );
  }

  public async delete(id: number): Promise<null | UserReport> {
    return this.executeAsync(
      async () => {
        return await this.prisma.userReport.delete({ where: { id } });
      },
      { deadlineMs: 1000 }
    );
  }

  public async getById(id: number): Promise<UserReport | null> {
    return this.executeAsync(
      async () => {
        return await this.prisma.userReport.findUnique({ where: { id } });
      },
      { deadlineMs: 1000 }
    );
  }

  public async getByMultipleIds(ids: number[]): Promise<UserReport[]> {
    return this.executeAsync(
      async () => {
        return await this.prisma.userReport.findMany({
          where: { id: { in: ids } },
        });
      },
      { deadlineMs: 1000 }
    );
  }

  public async getAllByFilter(
    filters: {
      reportTopic?: Topic;
      reportStatus?: Status;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const { reportTopic, reportStatus, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (reportTopic) where.reportTopic = reportTopic;
    if (reportStatus) where.reportStatus = reportStatus;

    return this.executeAsync(
      async () => {
        const [results, total] = await Promise.all([
          this.prisma.userReport.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
          }),
          this.prisma.userReport.count({ where }),
        ]);
        return { results, total };
      },
      { deadlineMs: 1000 }
    );
  }

  public async updateStatus(
    id: number,
    reportStatus: Status
  ): Promise<UserReport> {
    return this.executeAsync(
      async () => {
        return await this.prisma.userReport.update({
          where: { id },
          data: { reportStatus },
        });
      },
      { deadlineMs: 1000 }
    );
  }
}
export { UserReportRepository };
