"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const conflictError_1 = require("../../src/error/conflictError");
const httpError_1 = require("../../src/error/httpError");
const notFoundError_1 = require("../../src/error/notFoundError");
const contactService_1 = require("../../src/service/contactService");
const logger_1 = __importDefault(require("../../src/utility/logger"));
jest.mock("../../src/utility/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));
async function expectHttpError(promise, opts = {}) {
  await expect(promise).rejects.toBeInstanceOf(httpError_1.HttpError);
  try {
    await promise;
    throw new Error("Expected promise to reject, but it resolved.");
  } catch (err) {
    expect(err).toBeInstanceOf(httpError_1.HttpError);
    if (opts.statusCode !== undefined) {
      const status = err.statusCode ?? err.status;
      expect(status).toBe(opts.statusCode);
    }
    if (opts.messageIncludes) {
      const msg =
        err.message ??
        err?.payload?.message ??
        err?.body?.message ??
        err?.details?.message;
      expect(String(msg)).toContain(opts.messageIncludes);
    }
  }
}
describe("ContactService", () => {
  let contactRepository;
  let webService;
  let service;
  beforeEach(() => {
    jest.clearAllMocks();
    contactRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
      delete: jest.fn(),
      findByIds: jest.fn(),
      findAll: jest.fn(),
    };
    webService = {
      verifyGoogleCaptcha: jest.fn(),
    };
    service = new contactService_1.ContactService({
      contactRepository: contactRepository,
      webService: webService,
    });
  });
  describe("createContactRequest", () => {
    it("verifies captcha, creates contact, returns it", async () => {
      webService.verifyGoogleCaptcha.mockResolvedValue(true);
      const created = { id: 1, email: "a@b.com", topic: "t", message: "m" };
      contactRepository.create.mockResolvedValue(created);
      const result = await service.createContactRequest(
        "a@b.com",
        "t",
        "m",
        "cap"
      );
      expect(webService.verifyGoogleCaptcha).toHaveBeenCalledWith("cap");
      expect(contactRepository.create).toHaveBeenCalledWith({
        email: "a@b.com",
        topic: "t",
        message: "m",
      });
      expect(result).toEqual(created);
    });
    it("throws HttpError 401 when captcha is invalid", async () => {
      webService.verifyGoogleCaptcha.mockResolvedValue(false);
      await expectHttpError(
        service.createContactRequest("a@b.com", "t", "m", "cap"),
        { statusCode: 401, messageIncludes: "Invalid recaptcha" }
      );
      expect(contactRepository.create).not.toHaveBeenCalled();
      expect(logger_1.default.error).not.toHaveBeenCalled(); // it's an HttpError passthrough
    });
    it("rethrows HttpError from webService/repo (passthrough)", async () => {
      const err = new notFoundError_1.NotFoundError({
        statusCode: 400,
        message: "bad",
      });
      webService.verifyGoogleCaptcha.mockRejectedValue(err);
      await expect(
        service.createContactRequest("a@b.com", "t", "m", "cap")
      ).rejects.toBeInstanceOf(httpError_1.HttpError);
      expect(logger_1.default.error).not.toHaveBeenCalled();
    });
    it("wraps unknown error into HttpError 500 and logs", async () => {
      webService.verifyGoogleCaptcha.mockResolvedValue(true);
      contactRepository.create.mockRejectedValue(new Error("DB down"));
      await expectHttpError(
        service.createContactRequest("a@b.com", "t", "m", "cap"),
        {
          statusCode: 500,
          messageIncludes: "Internal server error",
        }
      );
      expect(logger_1.default.error).toHaveBeenCalledTimes(1);
      expect(logger_1.default.error.mock.calls[0][0]).toContain(
        "[ContactService] createContactRequest failed:"
      );
    });
  });
  describe("updateContactRequest", () => {
    it("throws HttpError 404 when contact does not exist", async () => {
      contactRepository.findById.mockResolvedValue(null);
      await expectHttpError(service.updateContactRequest(10, "e", "t", "m"), {
        statusCode: 404,
        messageIncludes: "not found",
      });
      expect(contactRepository.updateById).not.toHaveBeenCalled();
      expect(logger_1.default.error).not.toHaveBeenCalled(); // passthrough
    });
    it("updates existing contact and returns it", async () => {
      const existing = { id: 10 };
      const updated = {
        id: 10,
        email: "e",
        topic: "t",
        message: "m",
        status: "open",
      };
      contactRepository.findById.mockResolvedValue(existing);
      contactRepository.updateById.mockResolvedValue(updated);
      const result = await service.updateContactRequest(
        10,
        "e",
        "t",
        "m",
        "open"
      );
      expect(contactRepository.findById).toHaveBeenCalledWith(10);
      expect(contactRepository.updateById).toHaveBeenCalledWith(10, {
        email: "e",
        topic: "t",
        message: "m",
        status: "open",
      });
      expect(result).toEqual(updated);
    });
    it("rethrows HttpError (passthrough)", async () => {
      const err = new conflictError_1.ConflictError({
        statusCode: 409,
        message: "conflict",
      });
      contactRepository.findById.mockRejectedValue(err);
      await expect(
        service.updateContactRequest(10, "e", "t", "m")
      ).rejects.toBeInstanceOf(httpError_1.HttpError);
      expect(logger_1.default.error).not.toHaveBeenCalled();
    });
    it("wraps unknown error into HttpError 500 and logs", async () => {
      contactRepository.findById.mockResolvedValue({ id: 10 });
      contactRepository.updateById.mockRejectedValue(new Error("boom"));
      await expectHttpError(service.updateContactRequest(10, "e", "t", "m"), {
        statusCode: 500,
        messageIncludes: "Internal server error",
      });
      expect(logger_1.default.error).toHaveBeenCalledTimes(1);
      expect(logger_1.default.error.mock.calls[0][0]).toContain(
        "[ContactService] updateContactRequest failed:"
      );
    });
  });
  describe("deleteContactRequest", () => {
    it("throws HttpError 404 when contact does not exist", async () => {
      contactRepository.findById.mockResolvedValue(null);
      await expectHttpError(service.deleteContactRequest(10), {
        statusCode: 404,
        messageIncludes: "not found",
      });
      expect(contactRepository.delete).not.toHaveBeenCalled();
      expect(logger_1.default.error).not.toHaveBeenCalled();
    });
    it("deletes when contact exists", async () => {
      contactRepository.findById.mockResolvedValue({ id: 10 });
      contactRepository.delete.mockResolvedValue(undefined);
      await service.deleteContactRequest(10);
      expect(contactRepository.findById).toHaveBeenCalledWith(10);
      expect(contactRepository.delete).toHaveBeenCalledWith(10);
    });
    it("wraps unknown error into HttpError 500 and logs", async () => {
      contactRepository.findById.mockResolvedValue({ id: 10 });
      contactRepository.delete.mockRejectedValue(new Error("boom"));
      await expectHttpError(service.deleteContactRequest(10), {
        statusCode: 500,
        messageIncludes: "Internal server error",
      });
      expect(logger_1.default.error).toHaveBeenCalledTimes(1);
      expect(logger_1.default.error.mock.calls[0][0]).toContain(
        "[ContactService] deleteContactRequest failed:"
      );
    });
  });
  describe("findContactRequestById", () => {
    it("throws HttpError 404 when contact does not exist", async () => {
      contactRepository.findById.mockResolvedValue(null);
      await expectHttpError(service.findContactRequestById(10), {
        statusCode: 404,
        messageIncludes: "not found",
      });
      expect(logger_1.default.error).not.toHaveBeenCalled();
    });
    it("returns contact when found", async () => {
      const found = { id: 10 };
      contactRepository.findById.mockResolvedValue(found);
      const result = await service.findContactRequestById(10);
      expect(contactRepository.findById).toHaveBeenCalledWith(10);
      expect(result).toEqual(found);
    });
    it("wraps unknown error into HttpError 500 and logs", async () => {
      contactRepository.findById.mockRejectedValue(new Error("boom"));
      await expectHttpError(service.findContactRequestById(10), {
        statusCode: 500,
        messageIncludes: "Internal server error",
      });
      expect(logger_1.default.error).toHaveBeenCalledTimes(1);
      expect(logger_1.default.error.mock.calls[0][0]).toContain(
        "[ContactService] findContactRequestById failed:"
      );
    });
  });
  describe("findContactRequestsByIds", () => {
    it("returns contacts", async () => {
      const contacts = [{ id: 1 }, { id: 2 }];
      contactRepository.findByIds.mockResolvedValue(contacts);
      const result = await service.findContactRequestsByIds([1, 2]);
      expect(contactRepository.findByIds).toHaveBeenCalledWith([1, 2]);
      expect(result).toEqual(contacts);
    });
    it("wraps unknown error into HttpError 500 and logs", async () => {
      contactRepository.findByIds.mockRejectedValue(new Error("boom"));
      await expectHttpError(service.findContactRequestsByIds([1, 2]), {
        statusCode: 500,
        messageIncludes: "Internal server error",
      });
      expect(logger_1.default.error).toHaveBeenCalledTimes(1);
      expect(logger_1.default.error.mock.calls[0][0]).toContain(
        "[ContactService] findContactRequestsByIds failed:"
      );
    });
  });
  describe("findAllContactRequests", () => {
    it("returns paginated response with totalPages and currentPage", async () => {
      contactRepository.findAll.mockResolvedValue({
        results: [{ id: 1 }, { id: 2 }],
        total: 21,
      });
      const result = await service.findAllContactRequests(2, 10);
      expect(contactRepository.findAll).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
      });
      expect(result).toEqual({
        data: [{ id: 1 }, { id: 2 }],
        total: 21,
        totalPages: Math.ceil(21 / 10), // 3
        currentPage: 2,
      });
    });
    it("uses defaults when called with no args", async () => {
      contactRepository.findAll.mockResolvedValue({ results: [], total: 0 });
      const result = await service.findAllContactRequests();
      expect(contactRepository.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 15,
      });
      expect(result).toEqual({
        data: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
      });
    });
    it("wraps unknown error into HttpError 500 and logs", async () => {
      contactRepository.findAll.mockRejectedValue(new Error("boom"));
      await expectHttpError(service.findAllContactRequests(1, 15), {
        statusCode: 500,
        messageIncludes: "Internal server error",
      });
      expect(logger_1.default.error).toHaveBeenCalledTimes(1);
      expect(logger_1.default.error.mock.calls[0][0]).toContain(
        "[ContactService] findAllContactRequests failed:"
      );
    });
  });
});
