import type { FastifyReply, FastifyRequest } from "fastify";
import type { CreateCourseDto, UpdateCourseDto } from "../dto/courseSchema";
import type { CourseService } from "../service/courseService";

class CourseController {
  private readonly courseService: CourseService;

  constructor(courseService: CourseService) {
    this.courseService = courseService;
    this.getCourses = this.getCourses.bind(this);
    this.getCourse = this.getCourse.bind(this);
    this.createCourse = this.createCourse.bind(this);
    this.updateCourse = this.updateCourse.bind(this);
    this.deleteCourse = this.deleteCourse.bind(this);
  }

  public async getCourses() {}

  public async getCourse() {}

  public async createCourse(
    req: FastifyRequest<{ Body: CreateCourseDto }>,
    reply: FastifyReply,
  ) {}

  public async updateCourse(
    req: FastifyRequest<{ Body: UpdateCourseDto }>,
    reply: FastifyReply,
  ) {}

  public async deleteCourse(
    req: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {}
}

export { CourseController };
