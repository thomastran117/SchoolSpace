import type { CacheService } from "./cacheService";
import type { CatalogueService } from "./catalogueService";
import type { FileService } from "./fileService";
import type { UserService } from "./userService";

import type { ICourse } from "../templates/mongoTemplate";
import { CourseModel } from "../templates/mongoTemplate";
import { BasicService } from "./basicService";

class CourseService extends BasicService {
  private readonly cacheService: CacheService;
  private readonly fileService: FileService;
  private readonly userService: UserService;
  private readonly catalogueService: CatalogueService;

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
    image: Express.Multer.File,
    year?: number,
  ): Promise<ICourse> {
    await this.userService.getUser(userId);
    await this.catalogueService.getCourseTemplateById(templateId);

    const { fileName, filePath, publicUrl } = await this.fileService.uploadFile(
      image.buffer,
      image.originalname,
      "course",
    );

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
