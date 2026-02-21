import BadRequestError from "@error/badRequestError";
import HttpError from "@error/httpError";
import InternalServerError from "@error/internalServerError";
import NotFoundError from "@error/notFoundError";
import TooManyRequestsError from "@error/tooManyRequestError";
import type { Status, Topic, UserReport } from "@models/userReport";
import type UserReportRepository from "@repository/userReportRepository";
import type CacheService from "@service/cacheService";
import type UserService from "@service/userService";
import type WebService from "@service/webService";
import logger from "@utility/logger";

type GetAllFilters = {
  reportTopic?: Topic;
  reportStatus?: Status;
  page?: number;
  limit?: number;
};

class UserReportService {
  private readonly userReportRepository: UserReportRepository;
  private readonly webService: WebService;
  private readonly userService: UserService;
  private readonly cacheService: CacheService;

  private static readonly RESUBMIT_WINDOW_SECONDS = 15 * 60;
  private static readonly REPORT_CACHE_SECONDS = 60;
  private static readonly LIST_CACHE_SECONDS = 30;

  constructor(dependencies: {
    userReportRepository: UserReportRepository;
    webService: WebService;
    userService: UserService;
    cacheService: CacheService;
  }) {
    this.userReportRepository = dependencies.userReportRepository;
    this.webService = dependencies.webService;
    this.userService = dependencies.userService;
    this.cacheService = dependencies.cacheService;
  }

  private reportCacheKey(id: number) {
    return `user_report:id:${id}`;
  }

  private reportIdsCacheKey(ids: number[]) {
    const sorted = [...ids].sort((a, b) => a - b);
    return `user_report:ids:${sorted.join(",")}`;
  }

  private reportListCacheKey(filters: GetAllFilters) {
    const { reportTopic, reportStatus, page = 1, limit = 20 } = filters;
    return `user_report:list:${reportTopic ?? "ANY"}:${reportStatus ?? "ANY"}:${page}:${limit}`;
  }

  private resubmitGuardKey(reportingUserId: number, reportedUserId: number) {
    return `user_report:resubmit_guard:${reportingUserId}:${reportedUserId}`;
  }

  private isValidTopic(topic: string): topic is Topic {
    return (
      topic === "UNDEFINED" ||
      topic === "HATE_SPEECH_HARASSMENT_OR_BULLYING" ||
      topic === "VIOLENT_THREATS" ||
      topic === "SPAM" ||
      topic === "INNAPPROPRIATE_CONTENT" ||
      topic === "FRAUD_OR_IMPERSONATION" ||
      topic === "OTHER"
    );
  }

  private isValidStatus(status: string): status is Status {
    return (
      status === "CREATED" ||
      status === "INPROGRESS" ||
      status === "VIEWED" ||
      status === "COMPLETED" ||
      status === "FAILED" ||
      status === "DELETED" ||
      status === "ERROR"
    );
  }

  private async invalidateReportCaches(reportId?: number) {
    try {
      if (typeof reportId === "number") {
        await this.cacheService.delete(this.reportCacheKey(reportId));
      }
    } catch (e) {
      logger.warn(
        `[UserReportService] cache invalidation failed: ${String((e as any)?.message ?? e)}`
      );
    }
  }

  public async createReport(
    reportedUserId: number,
    reportingUserId: number,
    topic: string,
    description: string
  ): Promise<UserReport> {
    try {
      if (!Number.isInteger(reportedUserId) || reportedUserId <= 0) {
        throw new BadRequestError({ message: "Invalid reportedUserId." });
      }
      if (!Number.isInteger(reportingUserId) || reportingUserId <= 0) {
        throw new BadRequestError({ message: "Invalid reportingUserId." });
      }
      if (reportedUserId === reportingUserId) {
        throw new BadRequestError({ message: "You cannot report yourself." });
      }
      if (!this.isValidTopic(topic)) {
        throw new BadRequestError({ message: "Invalid report topic." });
      }

      if ((this.userService as any)?.getById) {
        const [victim, offender] = await Promise.all([
          (this.userService as any).getById(reportedUserId),
          (this.userService as any).getById(reportingUserId),
        ]);
        if (!victim)
          throw new NotFoundError({ message: "Reported user not found." });
        if (!offender)
          throw new NotFoundError({ message: "Reporting user not found." });
      }

      const guardKey = this.resubmitGuardKey(reportingUserId, reportedUserId);
      const acquired = await this.cacheService.setIfNotExists(
        guardKey,
        { at: Date.now() },
        UserReportService.RESUBMIT_WINDOW_SECONDS
      );

      if (!acquired) {
        const exists = await this.cacheService.exists(guardKey);
        if (exists) {
          throw new TooManyRequestsError({
            message:
              "You recently submitted a report for this user. Please wait 15 minutes before submitting again.",
          });
        }
        // else: Redis likely unavailable => fail-open, continue.
      }

      const created = await this.userReportRepository.create({
        victimUserId: reportedUserId,
        offenderUserId: reportingUserId,
        reportTopic: topic,
        reportDescription: description?.trim() ? description.trim() : null,
        reportStatus: "CREATED",
      });

      await this.cacheService.set(
        this.reportCacheKey(created.id),
        created,
        UserReportService.REPORT_CACHE_SECONDS
      );

      return created;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[UserReportService] createReport failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async updateReport(params: {
    id: number;
    reportTopic?: Topic;
    reportDescription?: string | null;
    reportStatus?: Status;
  }): Promise<UserReport> {
    try {
      const { id, ...patch } = params;

      if (!Number.isInteger(id) || id <= 0) {
        throw new BadRequestError({ message: "Invalid report id." });
      }

      const existing = await this.userReportRepository.getById(id);
      if (!existing) throw new NotFoundError({ message: "Report not found." });

      const updated = await this.userReportRepository.update(id, patch);

      await this.invalidateReportCaches(id);
      await this.cacheService.set(
        this.reportCacheKey(id),
        updated,
        UserReportService.REPORT_CACHE_SECONDS
      );

      return updated;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(
        `[UserReportService] updateReport failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async deleteReport(
    id: number,
    hardDelete = false
  ): Promise<UserReport | null> {
    try {
      if (!Number.isInteger(id) || id <= 0) {
        throw new BadRequestError({ message: "Invalid report id." });
      }

      const existing = await this.userReportRepository.getById(id);
      if (!existing) return null;

      const result = hardDelete
        ? await this.userReportRepository.delete(id)
        : await this.userReportRepository.updateStatus(id, "DELETED");

      await this.invalidateReportCaches(id);

      return result;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(
        `[UserReportService] deleteReport failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async getReport(id: number): Promise<UserReport | null> {
    try {
      if (!Number.isInteger(id) || id <= 0) {
        throw new BadRequestError({ message: "Invalid report id." });
      }

      return await this.cacheService.getOrSet<UserReport | null>(
        this.reportCacheKey(id),
        UserReportService.REPORT_CACHE_SECONDS,
        async () => await this.userReportRepository.getById(id)
      );
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(
        `[UserReportService] getReport failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async getReportsByIds(ids: number[]): Promise<UserReport[]> {
    try {
      const cleanIds = [...new Set(ids)].filter(
        (x) => Number.isInteger(x) && x > 0
      );
      if (cleanIds.length === 0) return [];

      return await this.cacheService.getOrSet<UserReport[]>(
        this.reportIdsCacheKey(cleanIds),
        UserReportService.REPORT_CACHE_SECONDS,
        async () => await this.userReportRepository.getByMultipleIds(cleanIds)
      );
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(
        `[UserReportService] getReportsByIds failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async getAllReport(filters: GetAllFilters = {}) {
    try {
      if (filters.reportTopic && !this.isValidTopic(filters.reportTopic)) {
        throw new BadRequestError({ message: "Invalid reportTopic filter." });
      }
      if (filters.reportStatus && !this.isValidStatus(filters.reportStatus)) {
        throw new BadRequestError({ message: "Invalid reportStatus filter." });
      }

      return await this.cacheService.getOrSet<{
        results: UserReport[];
        total: number;
      }>(
        this.reportListCacheKey(filters),
        UserReportService.LIST_CACHE_SECONDS,
        async () => await this.userReportRepository.getAllByFilter(filters)
      );
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(
        `[UserReportService] getAllReport failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }
}

export { UserReportService };
export default UserReportService;
