import { AuthController } from "../../controller/authController";

describe("AuthController", () => {
  let controller: AuthController;

  const mockAuthService = {
    loginUser: jest.fn(),
    signupUser: jest.fn(),
    verifyUser: jest.fn(),
    forgotPassword: jest.fn(),
    changePassword: jest.fn(),
    googleOAuth: jest.fn(),
    microsoftOAuth: jest.fn(),
    generateNewTokens: jest.fn(),
    authLogout: jest.fn(),
  };

  const mockReply = () => {
    const reply: any = {};
    reply.code = jest.fn().mockReturnValue(reply);
    reply.send = jest.fn().mockReturnValue(reply);
    reply.setCookie = jest.fn().mockReturnValue(reply);
    reply.clearCookie = jest.fn().mockReturnValue(reply);
    return reply;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController(mockAuthService as any);
  });

  describe("localAuthenticate", () => {
    it("logs in user and sets refresh cookie", async () => {
      mockAuthService.loginUser.mockResolvedValue({
        accessToken: "access",
        refreshToken: "refresh",
        role: "student",
        username: "Tom",
        avatar: "avatar.png",
      });

      const req: any = {
        body: {
          email: "test@test.com",
          password: "pass",
          remember: true,
          captcha: "captcha",
        },
      };

      const reply = mockReply();

      await controller.localAuthenticate(req, reply);

      expect(mockAuthService.loginUser).toHaveBeenCalledWith(
        "test@test.com",
        "pass",
        true,
        "captcha",
      );

      expect(reply.setCookie).toHaveBeenCalledWith(
        "refreshToken",
        "refresh",
        expect.objectContaining({ httpOnly: true }),
      );

      expect(reply.code).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith({
        message: "Login successful",
        accessToken: "access",
        role: "student",
        avatar: "avatar.png",
        username: "Tom",
      });
    });
  });

  describe("localSignup", () => {
    it("signs up user successfully", async () => {
      mockAuthService.signupUser.mockResolvedValue(true);

      const req: any = {
        body: {
          email: "test@test.com",
          password: "pass",
          role: "student",
          captcha: "captcha",
        },
      };

      const reply = mockReply();

      await controller.localSignup(req, reply);

      expect(mockAuthService.signupUser).toHaveBeenCalled();
      expect(reply.code).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith({
        message: "Email verification sent. Please verify.",
      });
    });
  });

  describe("localVerifyEmail", () => {
    it("verifies email token", async () => {
      mockAuthService.verifyUser.mockResolvedValue(undefined);

      const req: any = {
        query: { token: "verify-token" },
      };

      const reply = mockReply();

      await controller.localVerifyEmail(req, reply);

      expect(mockAuthService.verifyUser).toHaveBeenCalledWith("verify-token");
      expect(reply.code).toHaveBeenCalledWith(200);
    });
  });

  describe("localForgotPassword", () => {
    it("initiates forgot password flow", async () => {
      mockAuthService.forgotPassword.mockResolvedValue(undefined);

      const req: any = { body: { email: "test@test.com" } };
      const reply = mockReply();

      await controller.localForgotPassword(req, reply);

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(
        "test@test.com",
      );
      expect(reply.code).toHaveBeenCalledWith(200);
    });
  });

  describe("localChangePassword", () => {
    it("changes password successfully", async () => {
      mockAuthService.changePassword.mockResolvedValue(undefined);

      const req: any = {
        query: { token: "token" },
        body: { password: "newpass" },
      };

      const reply = mockReply();

      await controller.localChangePassword(req, reply);

      expect(mockAuthService.changePassword).toHaveBeenCalledWith(
        "token",
        "newpass",
      );
      expect(reply.code).toHaveBeenCalledWith(200);
    });
  });

  describe("microsoftAuthenticate", () => {
    it("authenticates via Microsoft OAuth", async () => {
      mockAuthService.microsoftOAuth.mockResolvedValue({
        accessToken: "a",
        refreshToken: "r",
        role: "student",
        username: "Tom",
      });

      const req: any = { body: { id_token: "ms-token" } };
      const reply = mockReply();

      await controller.microsoftAuthenticate(req, reply);

      expect(reply.setCookie).toHaveBeenCalled();
      expect(reply.code).toHaveBeenCalledWith(200);
    });
  });

  describe("googleAuthenticate", () => {
    it("authenticates via Google OAuth", async () => {
      mockAuthService.googleOAuth.mockResolvedValue({
        accessToken: "a",
        refreshToken: "r",
        role: "student",
        username: "Tom",
      });

      const req: any = { body: { id_token: "google-token" } };
      const reply = mockReply();

      await controller.googleAuthenticate(req, reply);

      expect(reply.setCookie).toHaveBeenCalled();
      expect(reply.code).toHaveBeenCalledWith(200);
    });
  });

  describe("refreshAccessToken", () => {
    it("rotates refresh token", async () => {
      mockAuthService.generateNewTokens.mockResolvedValue({
        accessToken: "new-access",
        refreshToken: "new-refresh",
        role: "student",
        username: "Tom",
      });

      const req: any = {
        cookies: { refreshToken: "old-token" },
      };

      const reply = mockReply();

      await controller.refreshAccessToken(req, reply);

      expect(reply.setCookie).toHaveBeenCalled();
      expect(reply.code).toHaveBeenCalledWith(200);
    });
  });

  describe("logoutRefreshToken", () => {
    it("logs out user and clears cookie", async () => {
      mockAuthService.authLogout.mockResolvedValue(true);

      const req: any = {
        cookies: { refreshToken: "token" },
      };

      const reply = mockReply();

      await controller.logoutRefreshToken(req, reply);

      expect(mockAuthService.authLogout).toHaveBeenCalledWith("token");
      expect(reply.clearCookie).toHaveBeenCalledWith(
        "refreshToken",
        expect.any(Object),
      );
      expect(reply.code).toHaveBeenCalledWith(200);
    });

    it("returns already logged out when no token", async () => {
      const req: any = { cookies: {} };
      const reply = mockReply();

      await controller.logoutRefreshToken(req, reply);

      expect(reply.code).toHaveBeenCalledWith(200);
      expect(reply.send).toHaveBeenCalledWith({
        message: "Logged out already",
      });
    });
  });
});
