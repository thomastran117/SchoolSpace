import { AuthController } from "../../controller/authController";
import { HttpError, UnauthorizedError } from "../../error";
import logger from "../../utility/logger";

jest.mock("../../utility/logger", () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

type ReplyMock = {
  code: jest.Mock;
  send: jest.Mock;
  setCookie: jest.Mock;
  clearCookie: jest.Mock;
};

function makeReply(): ReplyMock {
  const reply: any = {};
  reply.code = jest.fn().mockImplementation(() => reply);
  reply.send = jest.fn().mockImplementation(() => reply);
  reply.setCookie = jest.fn().mockImplementation(() => reply);
  reply.clearCookie = jest.fn().mockImplementation(() => reply);
  return reply;
}

function makeReq(overrides: Partial<any> = {}) {
  return {
    body: {},
    params: {},
    query: {},
    cookies: {},
    ...overrides,
  } as any;
}

describe("AuthController", () => {
  let controller: AuthController;

  const mockAuthService = {
    loginUser: jest.fn(),
    signupUser: jest.fn(),
    verifyUser: jest.fn(),
    forgotPassword: jest.fn(),
    changePassword: jest.fn(),
    microsoftOAuth: jest.fn(),
    googleOAuth: jest.fn(),
    generateNewTokens: jest.fn(),
    authLogout: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // IMPORTANT: construct controller with the right DI shape
    // Most likely: new AuthController({ authService: mockAuthService })
    controller = new AuthController({ authService: mockAuthService as any } as any);
  });

  describe("localAuthenticate", () => {
    it("logs in user and sets refresh cookie", async () => {
      mockAuthService.loginUser.mockResolvedValue({
        accessToken: "access",
        refreshToken: "refresh",
        role: "student",
        id: 1,
        username: "Tom",
        avatar: "img.png",
      });

      const req = makeReq({
        body: {
          email: "test@test.com",
          password: "pass",
          remember: false,
          captcha: "captcha",
        },
      });
      const reply = makeReply();

      await controller.localAuthenticate(req, reply as any);

      expect(mockAuthService.loginUser).toHaveBeenCalledWith(
        "test@test.com",
        "pass",
        false,
        "captcha"
      );

      expect(reply.setCookie).toHaveBeenCalledWith(
        "refreshToken",
        "refresh",
        expect.any(Object)
      );

      expect(reply.code).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Login successful",
          accessToken: "access",
          role: "student",
          username: "Tom",
          avatar: "img.png",
        })
      );
    });

    it("rethrows HttpError from service", async () => {
      const err = new UnauthorizedError({ statusCode: 401, message: "Invalid credentials" } as any);
      mockAuthService.loginUser.mockRejectedValue(err);

      const req = makeReq({
        body: { email: "x@test.com", password: "bad", remember: false, captcha: "c" },
      });
      const reply = makeReply();

      await expect(controller.localAuthenticate(req, reply as any)).rejects.toBeInstanceOf(HttpError);
      expect(logger.error).not.toHaveBeenCalled(); // controller rethrows HttpError directly
    });
  });

  describe("localSignup", () => {
    it("signs up user successfully", async () => {
      mockAuthService.signupUser.mockResolvedValue(true);

      const req = makeReq({
        body: {
          email: "test@test.com",
          password: "pass",
          role: "student",
          captcha: "captcha",
        },
      });
      const reply = makeReply();

      await controller.localSignup(req, reply as any);

      expect(mockAuthService.signupUser).toHaveBeenCalledWith(
        "test@test.com",
        "pass",
        "student",
        "captcha"
      );

      expect(reply.code).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        })
      );
    });
  });

  describe("localVerifyEmail", () => {
    it("verifies email token", async () => {
      const createdUser = { id: 1, email: "test@test.com" };
      mockAuthService.verifyUser.mockResolvedValue(createdUser);

      const req = makeReq({
        body: {
          email: "test@test.com",
          token: "123456",
          captcha: "captcha",
        },
      });
      const reply = makeReply();

      await controller.localVerifyEmail(req, reply as any);

      expect(mockAuthService.verifyUser).toHaveBeenCalledWith(
        "test@test.com",
        undefined,
        "captcha"
      );

      expect(reply.code).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.any(String),
        })
      );
    });

    it("throws if req.body is missing (your middleware should prevent this in prod)", async () => {
      const req = makeReq({ body: undefined });
      const reply = makeReply();

      await expect(controller.localVerifyEmail(req, reply as any)).rejects.toBeInstanceOf(HttpError);
    });
  });

  describe("localForgotPassword", () => {
    it("initiates forgot password flow", async () => {
      mockAuthService.forgotPassword.mockResolvedValue(undefined);

      const req = makeReq({
        body: { email: "test@test.com" },
      });
      const reply = makeReply();

      await controller.localForgotPassword(req, reply as any);

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith("test@test.com");
      expect(reply.code).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalled();
    });
  });

  describe("localChangePassword", () => {
    it("changes password successfully", async () => {
      mockAuthService.changePassword.mockResolvedValue(undefined);

      const req = makeReq({
        body: { password: "newpass" }, query: { token: "token"},
      });
      const reply = makeReply();

      await controller.localChangePassword(req, reply as any);

      expect(mockAuthService.changePassword).toHaveBeenCalledWith("token", "newpass");
      expect(reply.code).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalled();
    });
  });

  describe("microsoftAuthenticate", () => {
    it("authenticates via Microsoft OAuth", async () => {
      mockAuthService.microsoftOAuth.mockResolvedValue({
        accessToken: "a",
        refreshToken: "r",
        role: "student",
        id: 1,
        username: "test@test.com",
        avatar: null,
      });

      const req = makeReq({
        body: { id_token: "ms-token" },
      });
      const reply = makeReply();

      await controller.microsoftAuthenticate(req, reply as any);

      expect(mockAuthService.microsoftOAuth).toHaveBeenCalledWith("ms-token");
      expect(reply.setCookie).toHaveBeenCalledWith(
        "refreshToken",
        "r",
        expect.any(Object)
      );
      expect(reply.code).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalled();
    });
  });

  describe("googleAuthenticate", () => {
    it("authenticates via Google OAuth", async () => {
      mockAuthService.googleOAuth.mockResolvedValue({
        accessToken: "a",
        refreshToken: "r",
        role: "student",
        id: 1,
        username: "test@test.com",
        avatar: null,
      });

      const req = makeReq({
        body: { id_token: "google-token" },
      });
      const reply = makeReply();

      await controller.googleAuthenticate(req, reply as any);

      expect(mockAuthService.googleOAuth).toHaveBeenCalledWith("google-token");
      expect(reply.setCookie).toHaveBeenCalledWith(
        "refreshToken",
        "r",
        expect.any(Object)
      );
      expect(reply.code).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalled();
    });
  });

  describe("refreshAccessToken", () => {
    it("rotates refresh token", async () => {
      mockAuthService.generateNewTokens.mockResolvedValue({
        accessToken: "newA",
        refreshToken: "newR",
        role: "student",
        username: "Tom",
        avatar: "img.png",
      });

      const req = makeReq({
        cookies: { refreshToken: "oldR" }, // cookie name must match controller
      });
      const reply = makeReply();

      await controller.refreshAccessToken(req, reply as any);

      expect(mockAuthService.generateNewTokens).toHaveBeenCalledWith("oldR");
      expect(reply.setCookie).toHaveBeenCalledWith(
        "refreshToken",
        "newR",
        expect.any(Object)
      );
      expect(reply.code).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith(
          expect.objectContaining({
            accessToken: "newA",
            role: "student",
            username: "Tom",
            avatar: "img.png",
          }),
      );
    });
  });

  describe("logoutRefreshToken", () => {
    it("logs out user and clears cookie", async () => {
      mockAuthService.authLogout.mockResolvedValue(true);

      const req = makeReq({
        cookies: { refreshToken: "refresh" },
      });
      const reply = makeReply();

      await controller.logoutRefreshToken(req, reply as any);

      expect(mockAuthService.authLogout).toHaveBeenCalledWith("refresh");

      expect(reply.clearCookie).toHaveBeenCalledWith(
        "refreshToken",
        expect.any(Object)
      );
      expect(reply.code).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalled();
    });
  });
});
