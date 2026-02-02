/**
 * @file contactService.ts
 * @description
 * Handles all contact related business logic
 *
 * @module service
 * @version 1.0.0
 * @auth Thomas
 */
import {
  HttpError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../error";
import type { Status } from "../models/contact";
import type { ContactRepository } from "../repository/contactRepository";
import logger from "../utility/logger";
import type { WebService } from "./webService";

class ContactService {
  private readonly contactRepository: ContactRepository;
  private readonly webService: WebService;

  constructor(dependencies: {
    contactRepository: ContactRepository;
    webService: WebService;
  }) {
    this.contactRepository = dependencies.contactRepository;
    this.webService = dependencies.webService;
  }

  public async createContactRequest(
    email: string,
    topic: string,
    message: string,
    captcha: string
  ) {
    try {
      const result = await this.webService.verifyGoogleCaptcha(captcha);
      if (!result)
        throw new UnauthorizedError({ message: "Invalid recaptcha" });

      const contact = await this.contactRepository.create({
        email,
        topic,
        message,
      });
      return contact;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(
        `[ContactService] createContactRequest failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async updateContactRequest(
    id: number,
    email: string,
    topic: string,
    message: string,
    status?: Status
  ) {
    try {
      const contact = await this.contactRepository.findById(id);
      if (!contact)
        throw new NotFoundError({ message: "Contact Request is not found" });
      const updated = await this.contactRepository.updateById(id, {
        email,
        topic,
        message,
        status,
      });
      return updated;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(
        `[ContactService] updateContactRequest failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async deleteContactRequest(id: number) {
    try {
      const contact = await this.contactRepository.findById(id);
      if (!contact)
        throw new NotFoundError({ message: "Contact Request is not found" });
      await this.contactRepository.delete(id);
      return;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(
        `[ContactService] deleteContactRequest failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async findContactRequestById(id: number) {
    try {
      const contact = await this.contactRepository.findById(id);
      if (!contact)
        throw new NotFoundError({ message: "Contact Request is not found" });
      return contact;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(
        `[ContactService] findContactRequestById failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async findContactRequestsByIds(ids: number[]) {
    try {
      const contacts = await this.contactRepository.findByIds(ids);
      return contacts;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(
        `[ContactService] findContactRequestsByIds failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }

  public async findAllContactRequests(page = 1, limit = 15) {
    try {
      const { results, total } = await this.contactRepository.findAll({
        page,
        limit,
      });
      const response = {
        data: results,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };

      return response;
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      logger.error(
        `[ContactService] findAllContactRequests failed: ${err?.message ?? err}`
      );
      throw new InternalServerError({ message: "Internal server error" });
    }
  }
}

export { ContactService };
