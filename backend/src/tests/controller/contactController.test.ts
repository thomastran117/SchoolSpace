import { ContactController } from "@controller/contactController";
import { ForbiddenError } from "@error/forbiddenError";
import { HttpError } from "@error/httpError";
import { NotFoundError } from "@error/notFoundError";
import logger from "@utility/logger";

jest.mock("@utility/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

type ReplyMock = {
  code: jest.Mock;
  send: jest.Mock;
};

function makeReply(): ReplyMock {
  const reply: any = {};
  reply.code = jest.fn().mockImplementation(() => reply);
  reply.send = jest.fn().mockImplementation(() => reply);
  return reply;
}

function makeReq(overrides: Partial<any> = {}) {
  return {
    body: {},
    params: {},
    query: {},
    user: { id: 1, role: "admin" },
    ...overrides,
  } as any;
}

async function expectHttpError(
  promise: Promise<any>,
  opts: { statusCode?: number; messageIncludes?: string } = {}
) {
  await expect(promise).rejects.toBeInstanceOf(HttpError);

  try {
    await promise;
    throw new Error("Expected promise to reject, but it resolved.");
  } catch (err: any) {
    expect(err).toBeInstanceOf(HttpError);

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

describe("ContactController", () => {
  let contactService: {
    createContactRequest: jest.Mock;
    updateContactRequest: jest.Mock;
    deleteContactRequest: jest.Mock;
    findContactRequestById: jest.Mock;
    findAllContactRequests: jest.Mock;
  };

  let controller: ContactController;

  beforeEach(() => {
    jest.clearAllMocks();

    contactService = {
      createContactRequest: jest.fn(),
      updateContactRequest: jest.fn(),
      deleteContactRequest: jest.fn(),
      findContactRequestById: jest.fn(),
      findAllContactRequests: jest.fn(),
    };

    controller = new ContactController({
      contactService: contactService as any,
    });
  });

  describe("createContactRequest", () => {
    it("returns 200 with created contact request", async () => {
      const created = {
        id: 123,
        email: "a@b.com",
        topic: "Hello",
        message: "Hi",
      };
      contactService.createContactRequest.mockResolvedValue(created);

      const req = makeReq({
        body: {
          email: "a@b.com",
          topic: "Hello",
          message: "Hi",
          captcha: "token",
        },
      });
      const reply = makeReply();

      await controller.createContactRequest(req, reply as any);

      expect(contactService.createContactRequest).toHaveBeenCalledWith(
        "a@b.com",
        "Hello",
        "Hi",
        "token"
      );
      expect(reply.code).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith({
        message: "Contact request created successfully.",
        data: created,
      });
    });

    it("rethrows HttpError from service (passthrough)", async () => {
      const err = new ForbiddenError({
        statusCode: 403,
        message: "Nope",
      } as any);
      contactService.createContactRequest.mockRejectedValue(err);

      const req = makeReq({
        body: { email: "a@b.com", topic: "t", message: "m", captcha: "c" },
      });
      const reply = makeReply();

      await expect(
        controller.createContactRequest(req, reply as any)
      ).rejects.toBeInstanceOf(HttpError);
      expect((logger as any).error).not.toHaveBeenCalled();
    });

    it("wraps unknown error into HttpError (500) and logs", async () => {
      contactService.createContactRequest.mockRejectedValue(
        new Error("DB down")
      );

      const req = makeReq({
        body: { email: "a@b.com", topic: "t", message: "m", captcha: "c" },
      });
      const reply = makeReply();

      await expectHttpError(
        controller.createContactRequest(req, reply as any),
        {
          statusCode: 500,
          messageIncludes: "Internal server error",
        }
      );

      expect((logger as any).error).toHaveBeenCalledTimes(1);
      expect((logger as any).error.mock.calls[0][0]).toContain(
        "[ContactController] createContactRequest failed:"
      );
    });
  });

  describe("updateContactRequest", () => {
    it("throws HttpError (403) when user is not admin", async () => {
      const req = makeReq({
        user: { id: 2, role: "student" },
        params: { id: 10 },
        body: { email: "x@y.com" },
      });
      const reply = makeReply();

      await expectHttpError(
        controller.updateContactRequest(req, reply as any),
        {
          statusCode: 403,
          messageIncludes: "permission",
        }
      );

      expect(contactService.updateContactRequest).not.toHaveBeenCalled();
    });

    it("calls service with filtered partial updates and returns 200", async () => {
      const updated = { id: 10, email: "new@x.com", topic: "T", message: "M" };
      contactService.updateContactRequest.mockResolvedValue(updated);

      const req = makeReq({
        params: { id: 10 },
        body: {
          email: "new@x.com",
          topic: undefined, // ignored
          message: "M",
        },
      });
      const reply = makeReply();

      await controller.updateContactRequest(req, reply as any);

      expect(contactService.updateContactRequest).toHaveBeenCalledWith(
        10,
        "new@x.com",
        undefined,
        "M"
      );

      expect(reply.code).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith({
        message: "Contact request updated successfully.",
        data: updated,
      });
    });

    it("rethrows HttpError from service (passthrough)", async () => {
      const err = new NotFoundError({
        statusCode: 404,
        message: "Not found",
      } as any);
      contactService.updateContactRequest.mockRejectedValue(err);

      const req = makeReq({ params: { id: 10 }, body: { email: "a@b.com" } });
      const reply = makeReply();

      await expect(
        controller.updateContactRequest(req, reply as any)
      ).rejects.toBeInstanceOf(HttpError);
      expect((logger as any).error).not.toHaveBeenCalled();
    });

    it("wraps unknown error into HttpError (500) and logs", async () => {
      contactService.updateContactRequest.mockRejectedValue(new Error("boom"));

      const req = makeReq({ params: { id: 10 }, body: { email: "a@b.com" } });
      const reply = makeReply();

      await expectHttpError(
        controller.updateContactRequest(req, reply as any),
        {
          statusCode: 500,
          messageIncludes: "Internal server error",
        }
      );

      expect((logger as any).error).toHaveBeenCalledTimes(1);
      expect((logger as any).error.mock.calls[0][0]).toContain(
        "[ContactController] updateContactRequest failed:"
      );
    });
  });

  describe("deleteContactRequest", () => {
    it("throws HttpError (403) when user is not admin", async () => {
      const req = makeReq({
        user: { id: 2, role: "teacher" },
        params: { id: 55 },
      });
      const reply = makeReply();

      await expectHttpError(
        controller.deleteContactRequest(req, reply as any),
        {
          statusCode: 403,
          messageIncludes: "permission",
        }
      );

      expect(contactService.deleteContactRequest).not.toHaveBeenCalled();
    });

    it("deletes and returns 200", async () => {
      contactService.deleteContactRequest.mockResolvedValue(undefined);

      const req = makeReq({ params: { id: 55 } });
      const reply = makeReply();

      await controller.deleteContactRequest(req, reply as any);

      expect(contactService.deleteContactRequest).toHaveBeenCalledWith(55);
      expect(reply.code).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith({
        message: "Contact request deleted successfully.",
      });
    });

    it("wraps unknown error into HttpError (500) and logs", async () => {
      contactService.deleteContactRequest.mockRejectedValue(new Error("boom"));

      const req = makeReq({ params: { id: 55 } });
      const reply = makeReply();

      await expectHttpError(
        controller.deleteContactRequest(req, reply as any),
        {
          statusCode: 500,
          messageIncludes: "Internal server error",
        }
      );

      expect((logger as any).error).toHaveBeenCalledTimes(1);
      expect((logger as any).error.mock.calls[0][0]).toContain(
        "[ContactController] deleteContactRequest failed:"
      );
    });
  });

  describe("getContactRequest", () => {
    it("throws HttpError (403) when user is not admin", async () => {
      const req = makeReq({
        user: { id: 3, role: "student" },
        params: { id: 9 },
      });
      const reply = makeReply();

      await expectHttpError(controller.getContactRequest(req, reply as any), {
        statusCode: 403,
        messageIncludes: "permission",
      });

      expect(contactService.findContactRequestById).not.toHaveBeenCalled();
    });

    it("returns 200 with contact request", async () => {
      const found = { id: 9, email: "x@y.com", topic: "t", message: "m" };
      contactService.findContactRequestById.mockResolvedValue(found);

      const req = makeReq({ params: { id: 9 } });
      const reply = makeReply();

      await controller.getContactRequest(req, reply as any);

      expect(contactService.findContactRequestById).toHaveBeenCalledWith(9);
      expect(reply.code).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith({
        message: "Contact request fetched successfully.",
        data: found,
      });
    });

    it("wraps unknown error into HttpError (500) and logs", async () => {
      contactService.findContactRequestById.mockRejectedValue(
        new Error("boom")
      );

      const req = makeReq({ params: { id: 9 } });
      const reply = makeReply();

      await expectHttpError(controller.getContactRequest(req, reply as any), {
        statusCode: 500,
        messageIncludes: "Internal server error",
      });

      expect((logger as any).error).toHaveBeenCalledTimes(1);
      expect((logger as any).error.mock.calls[0][0]).toContain(
        "[ContactController] getContactRequest failed:"
      );
    });
  });

  describe("getContactRequests", () => {
    it("throws HttpError (403) when user is not admin", async () => {
      const req = makeReq({
        user: { id: 4, role: "teacher" },
        query: { page: "1", limit: "10" },
      });
      const reply = makeReply();

      await expectHttpError(controller.getContactRequests(req, reply as any), {
        statusCode: 403,
        messageIncludes: "permission",
      });

      expect(contactService.findAllContactRequests).not.toHaveBeenCalled();
    });

    it("parses pagination and returns 200", async () => {
      const result = {
        data: [{ id: 1 }],
        total: 1,
        totalPages: 1,
        page: 2,
        limit: 5,
      };
      contactService.findAllContactRequests.mockResolvedValue(result);

      const req = makeReq({ query: { page: "2", limit: "5" } });
      const reply = makeReply();

      await controller.getContactRequests(req, reply as any);

      expect(contactService.findAllContactRequests).toHaveBeenCalledWith(2, 5);
      expect(reply.code).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith({
        message: "Contact requests retrieved successfully.",
        ...result,
      });
    });

    it("uses defaults when page/limit are invalid", async () => {
      contactService.findAllContactRequests.mockResolvedValue({
        data: [],
        total: 0,
        totalPages: 0,
        page: 1,
        limit: 15,
      });

      const req = makeReq({ query: { page: "0", limit: "nope" } });
      const reply = makeReply();

      await controller.getContactRequests(req, reply as any);

      expect(contactService.findAllContactRequests).toHaveBeenCalledWith(1, 15);
    });

    it("wraps unknown error into HttpError (500) and logs", async () => {
      contactService.findAllContactRequests.mockRejectedValue(
        new Error("boom")
      );

      const req = makeReq({ query: { page: "1", limit: "15" } });
      const reply = makeReply();

      await expectHttpError(controller.getContactRequests(req, reply as any), {
        statusCode: 500,
        messageIncludes: "Internal server error",
      });

      expect((logger as any).error).toHaveBeenCalledTimes(1);
      expect((logger as any).error.mock.calls[0][0]).toContain(
        "[ContactController] getContactRequests failed:"
      );
    });
  });
});
