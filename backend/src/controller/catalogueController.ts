import type { Request, Response, NextFunction } from "express";
import type { TypedRequest, TypedResponse } from "../types/express";
import type { CatalogueService } from "../service/catalogueService";
import { httpError } from "../utility/httpUtility";
import type { UserPayload } from "../models/token";
import type {
  CreateCatalogueDto,
  UpdateCatalogueDto,
  QueryCatalogueDto,
} from "../dto/catalogueSchema";
import type {
  CatalogueResponseDto,
  CatalogueListResponseDto,
} from "../dto/catalogueSchema";
import { CatalogueResponseSchema } from "../dto/catalogueSchema";
import type { Term } from "../resource/schema_mongo";

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
    res: TypedResponse<{ message: string; data: CatalogueResponseDto }>,
    next: NextFunction,
  ) {
    try {
      const { role: userRole } = req.user as UserPayload;
      if (userRole !== "admin")
        throw httpError(403, "You lack permissions to perform this action.");

      const { course_name, description, course_code, term, available } =
        req.body;

      const result = await this.catalogueService.createCourse(
        course_name,
        description,
        course_code,
        term,
        available,
      );
      const safeData = CatalogueResponseSchema.parse(result);

      return res.status(201).json({
        message: "Course template created successfully.",
        data: safeData,
      });
    } catch (err) {
      next(err);
    }
  }

  public async updateCourseTemplate(
    req: TypedRequest<UpdateCatalogueDto>,
    res: TypedResponse<{ message: string; data: CatalogueResponseDto }>,
    next: NextFunction,
  ) {
    try {
      const { role: userRole } = req.user as UserPayload;
      if (userRole !== "admin")
        throw httpError(403, "You lack permissions to perform this action.");

      const { id: courseId } = req.params as unknown as { id: number };

      const { course_name, description, course_code, term, available } =
        req.body;

      const result = await this.catalogueService.updateCourse(
        courseId,
        course_name,
        description,
        course_code,
        term,
        available,
      );

      const safeData = CatalogueResponseSchema.parse(result);

      return res.status(201).json({
        message: "Course template created successfully.",
        data: safeData,
      });
    } catch (err) {
      next(err);
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
        throw httpError(403, "You lack permissions to perform this action.");

      const { id: courseId } = req.params as unknown as { id: number };

      await this.catalogueService.deleteCourse(courseId);

      return res.status(200).json({
        message: "Course template deleted successfully.",
      });
    } catch (err) {
      next(err);
    }
  }

  public async getCourseTemplate(
    req: Request,
    res: TypedResponse<{ message: string; data: CatalogueResponseDto }>,
    next: NextFunction,
  ) {
    try {
      const { id: courseId } = req.params as unknown as { id: number };

      const course = await this.catalogueService.getCourseById(courseId);
      const safeData = CatalogueResponseSchema.parse(course);

      return res.status(201).json({
        message: "Course template fetched successfully.",
        data: safeData,
      });
    } catch (err) {
      next(err);
    }
  }

  public async getCourseTemplates(
    req: TypedRequest<QueryCatalogueDto>,
    res: TypedResponse<{
      message: string;
      count: number;
      data: CatalogueListResponseDto;
    }>,
    next: NextFunction,
  ) {
    try {
      const { term, available, search } = req.query;
      const result = await this.catalogueService.getCourses(
        term as Term,
        available as boolean,
        search as string,
      );

      const safeData = result.map((result) =>
        CatalogueResponseSchema.parse(result),
      );

      return res.status(200).json({
        message: "Courses retrieved successfully.",
        count: safeData.length,
        data: safeData as any,
      });
    } catch (err) {
      next(err);
    }
  }
}

export { CatalogueController };
