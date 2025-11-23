import { AuthController } from "../../controller/authController";
import { HttpError } from "../../utility/httpUtility";
import env from "../../config/envConfigs";
import { sendCookie } from "../../utility/httpUtility";

// Mock environment features
jest.mock("../../config/envConfigs", () => ({
  isEmailEnabled: jest.fn(() => true),
  isMicrosoftEnabled: jest.fn(() => true),
  isCaptchaEnabled: jest.fn(() => true),
}));

// Mock sendCookie helper
jest.mock("../../utility/httpUtility", () => {
  const original = jest.requireActual("../../utility/httpUtility");
  return {
    ...original,
    sendCookie: jest.fn(),
  };
});

// Utility function to create mock req/res
function mockReqRes() {
  const req: any = {
    body: {},
    query: {},
    cookies: {},
  };

  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    clearCookie: jest.fn(),
  };

  const next = jest.fn();

  return { req, res, next };
}

describe("AuthController", () => {
  let authService: any;
  let controller: AuthController;

  beforeEach(() => {
    jest.clearAllMocks();

    authService = {
      loginUser: jest.fn(),
      signupUser: jest.fn(),
      verifyUser: jest.fn(),
      forgotPassword: jest.fn(),
      changePassword: jest.fn(),
      googleOAuth: jest.fn(),
      microsoftOAuth: jest.fn(),
      appleOAuth: jest.fn(),
      generateNewTokens: jest.fn(),
      authLogout: jest.fn(),
    };

    controller = new AuthController(authService);
  });

  // ---------------------------------------------------------
  // localAuthenticate
  // ---------------------------------------------------------
  describe("localAuthenticate", () => {
    it("logs in a user successfully", async () => {
      const { req, res, next } = mockReqRes();
      req.body = {
        email: "test@test.com",
        password: "123",
        remember: false,
        captcha: "cap",
      };

      authService.loginUser.mockResolvedValue({
        accessToken: "a",
        refreshToken: "r",
        username: "john",
        avatar: "img",
        role: "student",
      });

      await controller.localAuthenticate(req, res, next);

      expect(authService.loginUser).toHaveBeenCalled();
      expect(sendCookie).toHaveBeenCalledWith(res, "r");
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("passes HttpError to next()", async () => {
      const { req, res, next } = mockReqRes();
      const err = new HttpError(401, "bad");
      authService.loginUser.mockRejectedValue(err);

      await controller.localAuthenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  // ---------------------------------------------------------
  // localSignup
  // ---------------------------------------------------------
  describe("localSignup", () => {
    it("signs up a user", async () => {
      const { req, res, next } = mockReqRes();
      req.body = { email: "e", password: "p", role: "student", captcha: "c" };

      await controller.localSignup(req, res, next);

      expect(authService.signupUser).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // ---------------------------------------------------------
  // localVerifyEmail
  // ---------------------------------------------------------
  describe("localVerifyEmail", () => {
    it("verifies user email", async () => {
      const { req, res, next } = mockReqRes();
      req.query = { token: "t" };

      await controller.localVerifyEmail(req, res, next);

      expect(authService.verifyUser).toHaveBeenCalledWith("t");
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("throws 400 when missing token", async () => {
      const { req, res, next } = mockReqRes();

      await controller.localVerifyEmail(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    });
  });

  // ---------------------------------------------------------
  // localForgotPassword
  // ---------------------------------------------------------
  describe("localForgotPassword", () => {
    it("sends forgot password flow regardless of existing user", async () => {
      const { req, res, next } = mockReqRes();
      req.body.email = "e@test.com";

      await controller.localForgotPassword(req, res, next);

      expect(authService.forgotPassword).toHaveBeenCalledWith("e@test.com");
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ---------------------------------------------------------
  // localChangePassword
  // ---------------------------------------------------------
  describe("localChangePassword", () => {
    it("changes password with a valid token", async () => {
      const { req, res, next } = mockReqRes();
      req.query.token = "t";
      req.body.password = "newpass";

      await controller.localChangePassword(req, res, next);

      expect(authService.changePassword).toHaveBeenCalledWith("t", "newpass");
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("errors on missing token", async () => {
      const { req, next } = mockReqRes();

      await controller.localChangePassword(req, {}, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    });
  });

  // ---------------------------------------------------------
  // googleAuthenticate
  // ---------------------------------------------------------
  describe("googleAuthenticate", () => {
    it("authenticates via Google", async () => {
      const { req, res, next } = mockReqRes();
      req.body.id_token = "gt";

      authService.googleOAuth.mockResolvedValue({
        accessToken: "a",
        refreshToken: "r",
        username: "john",
        avatar: undefined,
        role: "student",
      });

      await controller.googleAuthenticate(req, res, next);

      expect(authService.googleOAuth).toHaveBeenCalledWith("gt");
      expect(sendCookie).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("rejects missing Google token", async () => {
      const { req, res, next } = mockReqRes();

      await controller.googleAuthenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    });
  });

  // ---------------------------------------------------------
  // microsoftAuthenticate
  // ---------------------------------------------------------
  describe("microsoftAuthenticate", () => {
    it("authenticates via Microsoft", async () => {
      const { req, res, next } = mockReqRes();
      req.body.id_token = "mt";

      authService.microsoftOAuth.mockResolvedValue({
        accessToken: "a",
        refreshToken: "r",
        username: "john",
        avatar: "img",
        role: "student",
      });

      await controller.microsoftAuthenticate(req, res, next);

      expect(authService.microsoftOAuth).toHaveBeenCalledWith("mt");
      expect(sendCookie).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // ---------------------------------------------------------
  // appleAuthenticate
  // ---------------------------------------------------------
  describe("appleAuthenticate", () => {
    it("authenticates via Apple", async () => {
      const { req, res, next } = mockReqRes();
      req.body.id_token = "at";

      authService.googleOAuth.mockResolvedValue({
        accessToken: "a",
        refreshToken: "r",
        username: "john",
        avatar: undefined,
        role: "student",
      });

      await controller.appleAuthenticate(req, res, next);

      expect(authService.googleOAuth).toHaveBeenCalledWith("at");
      expect(sendCookie).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("errors on missing Apple token", async () => {
      const { req, res, next } = mockReqRes();

      await controller.appleAuthenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    });
  });

  // ---------------------------------------------------------
  // refreshAccessToken
  // ---------------------------------------------------------
  describe("refreshAccessToken", () => {
    it("refreshes access token", async () => {
      const { req, res, next } = mockReqRes();
      req.cookies.refreshToken = "old";

      authService.generateNewTokens.mockResolvedValue({
        accessToken: "a",
        refreshToken: "r",
        username: "john",
        avatar: undefined,
        role: "student",
      });

      await controller.refreshAccessToken(req, res, next);

      expect(authService.generateNewTokens).toHaveBeenCalledWith("old");
      expect(sendCookie).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("throws if refresh cookie missing", async () => {
      const { req, res, next } = mockReqRes();

      await controller.refreshAccessToken(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(HttpError));
    });
  });

  // ---------------------------------------------------------
  // logoutRefreshToken
  // ---------------------------------------------------------
  describe("logoutRefreshToken", () => {
    it("logs out the user and clears cookie", async () => {
      const { req, res, next } = mockReqRes();
      req.cookies.refreshToken = "rt";

      authService.authLogout.mockResolvedValue(true);

      await controller.logoutRefreshToken(req, res, next);

      expect(authService.authLogout).toHaveBeenCalledWith("rt");
      expect(res.clearCookie).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: "Logged out successfully" });
    });

    it("returns early if already logged out", async () => {
      const { req, res } = mockReqRes();
      req.cookies = {};

      await controller.logoutRefreshToken(req, res, jest.fn());

      expect(res.json).toHaveBeenCalledWith({ message: "Already logged out" });
    });
  });
});
