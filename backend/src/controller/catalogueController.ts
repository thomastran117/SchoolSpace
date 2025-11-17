import type { NextFunction, Request, Response } from "express";
import type {
  CreateCatalogueDto,
  QueryCatalogueDto,
  UpdateCatalogueDto,
} from "../dto/catalogueSchema";
import type { UserPayload } from "../models/token";
import type { CatalogueService } from "../service/catalogueService";
import type { TypedRequest, TypedResponse } from "../types/express";
import { httpError, HttpError } from "../utility/httpUtility";
import logger from "../utility/logger";

class CatalogueController {
  private readonly catalogueService: CatalogueService;

  constructor(catalogueService: CatalogueService) {
    this.catalogueService = catalogueService;

    this.createCourseTemplate = this.createCourseTemplate.bind(this);
    this.updateCourseTemplate = this.updateCourseTemplate.bind(this);
    this.deleteCourseTemplate = this.deleteCourseTemplate.bind(this);
    this.getCourseTemplate = this.getCourseTemplate.bind(this);
    this.getCourseTemplates = this.getCourseTemplates.bind(this);
  }

  public async createCourseTemplate(
    req: TypedRequest<CreateCatalogueDto>,
    res: TypedResponse<{ message: string; data: any }>,
    next: NextFunction,
  ) {
    try {
      const { role: userRole } = req.user as UserPayload;
      if (userRole !== "admin")
        httpError(403, "You lack permissions to perform this action.");

      const { course_name, description, course_code, term, available } =
        req.body;

      const result = await this.catalogueService.createCourseTemplate(
        course_name,
        description,
        course_code,
        term,
        available,
      );

      return res.status(201).json({
        message: "Course template created successfully.",
        data: result,
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        return next(err);
      }

      logger.error(
        `[CatalogueController] createCourseTemplate failed: ${err?.message ?? err}`,
      );

      return next(new HttpError(500, "Internal server error"));
    }
  }

  public async updateCourseTemplate(
    req: TypedRequest<UpdateCatalogueDto>,
    res: TypedResponse<{ message: string; data: any }>,
    next: NextFunction,
  ) {
    try {
      const { role: userRole } = req.user as UserPayload;
      if (userRole !== "admin")
        httpError(403, "You lack permissions to perform this action.");

      const { id: courseId } = req.params as unknown as { id: string };

      const { course_name, description, course_code, term, available } =
        req.body;

      const result = await this.catalogueService.updateCourseTemplate(
        courseId,
        course_name,
        description,
        course_code,
        term,
        available,
      );

      return res.status(200).json({
        message: "Course template updated successfully.",
        data: result,
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        return next(err);
      }

      logger.error(
        `[CatalogueController] updateCourseTemplate failed: ${err?.message ?? err}`,
      );

      return next(new HttpError(500, "Internal server error"));
    }
  }

  public async deleteCourseTemplate(
    req: Request,
    res: TypedResponse<{ message: string }>,
    next: NextFunction,
  ) {
    try {
      const { role: userRole } = req.user as UserPayload;
      if (userRole !== "admin")
        httpError(403, "You lack permissions to perform this action.");

      const { id: courseId } = req.params as unknown as { id: string };

      await this.catalogueService.deleteCourseTemplate(courseId);

      return res.status(200).json({
        message: "Course template deleted successfully.",
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        return next(err);
      }

      logger.error(
        `[CatalogueController] deleteCourseTemplate failed: ${err?.message ?? err}`,
      );

      return next(new HttpError(500, "Internal server error"));
    }
  }

  public async getCourseTemplate(
    req: Request,
    res: TypedResponse<{ message: string; data: any }>,
    next: NextFunction,
  ) {
    try {
      const { id: courseId } = req.params as unknown as { id: string };
      const course =
        await this.catalogueService.getCourseTemplateById(courseId);

      return res.status(200).json({
        message: "Course template fetched successfully.",
        data: course,
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        return next(err);
      }

      logger.error(
        `[CatalogueController] getCourseTemplate failed: ${err?.message ?? err}`,
      );

      return next(new HttpError(500, "Internal server error"));
    }
  }

  public async getCourseTemplates(
    req: TypedRequest<QueryCatalogueDto>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { term, available, search, page, limit } = req.query;

      const pageNum = page ? Number(page) : 1;
      const limitNum = limit ? Number(limit) : 15;

      const result = await this.catalogueService.getCourseTemplates(
        term as any,
        available as any,
        search as any,
        pageNum,
        limitNum,
      );

      return res.status(200).json({
        message: "Courses retrieved successfully.",
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        count: result.data.length,
        data: result.data as any,
      });
    } catch (err: any) {
      if (err instanceof HttpError) {
        return next(err);
      }

      logger.error(
        `[CatalogueController] getCourseTemplates failed: ${err?.message ?? err}`,
      );

      return next(new HttpError(500, "Internal server error"));
    }
  }
}

export { CatalogueController };
