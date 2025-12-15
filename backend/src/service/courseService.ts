import type { CacheService } from "./cacheService";
import type { CatalogueService } from "./catalogueService";
import type { FileService } from "./fileService";
import type { UserService } from "./userService";

import { MultipartFile } from "@fastify/multipart";
import type { ICourse } from "../templates/mongoTemplate";
import { CourseModel } from "../templates/mongoTemplate";
import { BaseService } from "./baseService";

class CourseService extends BaseService {
  private readonly cacheService: CacheService;
  private readonly fileService?: FileService;
  private readonly userService?: UserService;
  private readonly catalogueService?: CatalogueService;

  constructor(
    userService: UserService,
    catalogueService: CatalogueService,
    cacheService: CacheService,
    fileService: FileService,
  ) {
    super();
    this.userService = userService;
    this.catalogueService = catalogueService;
    this.cacheService = cacheService;
    this.fileService = fileService;
  }

  public async createCourse(
    userId: number,
    templateId: string,
    image: MultipartFile,
    year?: number,
  ): Promise<ICourse> {
    this.ensureDependencies("userService", "fileService", "catalogueService");
    await this.userService!.getUser(userId);
    await this.catalogueService!.getCourseTemplateById(templateId);

    const buffer = await image.toBuffer();

    const { fileName, filePath, publicUrl } =
      await this.fileService!.uploadFile(buffer, image.filename, "course");

    const finalYear = year ?? new Date().getFullYear();

    const course = await CourseModel.create({
      teacher_id: userId,
      catalogue: templateId,
      image_url: publicUrl,
      finalYear,
    });

    return this.toSafe(course.toObject());
  }

  public async updateCourse() {
    return;
  }

  public async deleteCourse() {
    return;
  }

  public async getCourse(id: string) {
    return;
  }

  public async getAllCourses() {
    return;
  }
}

export { CourseService };
