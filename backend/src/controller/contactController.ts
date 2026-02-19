/**
 * @file contactController.ts
 * @description
 * Handles HTTP request and response for Contact model
 *
 * @module controller
 * @version 2.0.0
 * @auth Thomas
 */
import type { CreateContactDto, UpdateContactDto } from "@dto/contactSchema";
import type { PaginationQuery } from "@dto/coreSchema";
import { ForbiddenError } from "@error/forbiddenError";
import { HttpError } from "@error/httpError";
import { InternalServerError } from "@error/internalServerError";
import type { UserPayload } from "@models/token";
import type { ContactService } from "@service/contactService";
import logger from "@utility/logger";
import type { FastifyReply, FastifyRequest } from "fastify";

class ContactController {
  private readonly contactService: ContactService;

  constructor(dependencies: { contactService: ContactService }) {
    this.contactService = dependencies.contactService;

    this.createContactRequest = this.createContactRequest.bind(this);
    this.deleteContactRequest = this.deleteContactRequest.bind(this);
    this.getContactRequest = this.getContactRequest.bind(this);
    this.getContactRequests = this.getContactRequests.bind(this);
    this.updateContactRequest = this.updateContactRequest.bind(this);
  }

  private parsePositiveInt(
    value: string | undefined,
    defaultValue: number
  ): number {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : defaultValue;
  }

  public async createContactRequest(
    req: FastifyRequest<{ Body: CreateContactDto }>,
    reply: FastifyReply
  ) {
    try {
      const contactRequest = await this.contactService.createContactRequest(
        req.body.email,
        req.body.topic,
        req.body.message,
        req.body.captcha
      );

      return reply.code(200).send({
        message: "Contact request created successfully.",
        data: contactRequest,
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[ContactController] createContactRequest failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async updateContactRequest(
    req: FastifyRequest<{ Body: UpdateContactDto; Params: { id: number } }>,
    reply: FastifyReply
  ) {
    try {
      const { id: userId, role: userRole } = req.user as UserPayload;
      if (userRole !== "admin") {
        throw new ForbiddenError({
          message: "User lacks the permission to perform this action",
        });
      }

      const updates: Partial<UpdateContactDto> = {};
      for (const [key, value] of Object.entries(req.body)) {
        if (value !== undefined) {
          (updates as any)[key] = value;
        }
      }
      const updated = await this.contactService.updateContactRequest(
        req.params.id,
        updates.email as any,
        updates.topic as any,
        updates.message as any
      );

      return reply.code(200).send({
        message: "Contact request updated successfully.",
        data: updated,
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[ContactController] updateContactRequest failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async deleteContactRequest(
    req: FastifyRequest<{ Params: { id: number } }>,
    reply: FastifyReply
  ) {
    try {
      const { id: userId, role: userRole } = req.user as UserPayload;
      if (userRole !== "admin") {
        throw new ForbiddenError({
          message: "User lacks the permission to perform this action",
        });
      }
      await this.contactService.deleteContactRequest(req.params.id);
      return reply.code(200).send({
        message: "Contact request deleted successfully.",
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[ContactController] deleteContactRequest failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async getContactRequest(
    req: FastifyRequest<{ Params: { id: number } }>,
    reply: FastifyReply
  ) {
    try {
      const { id: userId, role: userRole } = req.user as UserPayload;
      if (userRole !== "admin") {
        throw new ForbiddenError({
          message: "User lacks the permission to perform this action",
        });
      }
      const contactRequest = await this.contactService.findContactRequestById(
        req.params.id
      );

      return reply.code(200).send({
        message: "Contact request fetched successfully.",
        data: contactRequest,
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[ContactController] getContactRequest failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async getContactRequests(
    req: FastifyRequest<{ Querystring: PaginationQuery }>,
    reply: FastifyReply
  ) {
    try {
      const { id: userId, role: userRole } = req.user as UserPayload;
      if (userRole !== "admin") {
        throw new ForbiddenError({
          message: "User lacks the permission to perform this action",
        });
      }
      const page = this.parsePositiveInt(req.query.page as any, 1);
      const limit = this.parsePositiveInt(req.query.limit as any, 15);

      const result = await this.contactService.findAllContactRequests(
        page,
        limit
      );
      return reply.code(200).send({
        message: "Contact requests retrieved successfully.",
        ...result,
      });
    } catch (err: any) {
      if (err instanceof HttpError) throw err;

      logger.error(
        `[ContactController] getContactRequests failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }
}

export { ContactController };
