import { AuthService } from "../../service/authService";
import { HttpError } from "../../utility/httpUtility";

describe("AuthService", () => {
  let authService: AuthService;

  const mockUserRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockEmailQueue = {
    enqueueVerifyEmail: jest.fn().mockResolvedValue(undefined),
    enqueueWelcomeEmail: jest.fn().mockResolvedValue(undefined),
  };

  const mockTokenService = {
    generateTokens: jest.fn(),
    createVerifyToken: jest.fn(),
    validateVerifyToken: jest.fn(),
    rotateRefreshToken: jest.fn(),
    logoutToken: jest.fn(),
  };

  const mockOAuthService = {
    verifyMicrosoftToken: jest.fn(),
    verifyGoogleToken: jest.fn(),
  };

  const mockWebService = {
    verifyGoogleCaptcha: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockWebService.verifyGoogleCaptcha.mockResolvedValue(true);

    authService = new AuthService(
      mockUserRepository as any,
      mockEmailQueue as any,
      mockTokenService as any,
      mockOAuthService as any,
      mockWebService as any
    );
  });

  describe("loginUser", () => {
    it("logs in a user successfully", async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 1,
        email: "test@test.com",
        password: "hashed",
        role: "student",
        username: "TestUser",
      });

      jest
        .spyOn<any, any>(authService as any, "comparePassword")
        .mockResolvedValue(true);

      mockTokenService.generateTokens.mockResolvedValue({
        accessToken: "access",
        refreshToken: "refresh",
      });

      const result = await authService.loginUser(
        "test@test.com",
        "password",
        false,
        "captcha"
      );

      expect(result).toEqual({
        accessToken: "access",
        refreshToken: "refresh",
        role: "student",
        id: 1,
        username: "TestUser",
        avatar: undefined,
      });
    });

    it("throws 401 on invalid password", async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 1,
        email: "test@test.com",
        password: "hashed",
      });

      jest
        .spyOn<any, any>(authService as any, "comparePassword")
        .mockResolvedValue(false);

      await expect(
        authService.loginUser("test@test.com", "wrong", false, "captcha")
      ).rejects.toBeInstanceOf(HttpError);
    });

    it("throws 401 when captcha fails", async () => {
      mockWebService.verifyGoogleCaptcha.mockResolvedValue(false);

      await expect(
        authService.loginUser("x@test.com", "pass", false, "bad")
      ).rejects.toBeInstanceOf(HttpError);
    });
  });

  describe("signupUser", () => {
    it("creates verify token and sends email", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      jest
        .spyOn<any, any>(authService as any, "hashPassword")
        .mockResolvedValue("hashed");

      mockTokenService.createVerifyToken.mockResolvedValue("verify-token");

      const result = await authService.signupUser(
        "test@test.com",
        "pass",
        "student",
        "captcha"
      );

      expect(result).toBe(true);
      expect(mockEmailQueue.enqueueVerifyEmail).toHaveBeenCalled();
    });

    it("throws 409 if email exists", async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        email: "test@test.com",
      });

      await expect(
        authService.signupUser("test@test.com", "pass", "student", "captcha")
      ).rejects.toBeInstanceOf(HttpError);
    });
  });

  describe("verifyUser", () => {
    it("creates user and sends welcome email", async () => {
      mockTokenService.validateVerifyToken.mockResolvedValue({
        email: "test@test.com",
        password: "hashed",
        role: "student",
      });

      mockUserRepository.create.mockResolvedValue({ id: 1 });

      const result = await authService.verifyUser("token");

      expect(result).toEqual({ id: 1 });
      expect(mockEmailQueue.enqueueWelcomeEmail).toHaveBeenCalled();
    });
  });

  describe("forgotPassword", () => {
    it("does nothing if user does not exist", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await authService.forgotPassword("x@test.com");

      expect(mockEmailQueue.enqueueVerifyEmail).not.toHaveBeenCalled();
    });

    it("sends reset email for local user", async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        email: "test@test.com",
        provider: "local",
      });

      mockTokenService.createVerifyToken.mockResolvedValue("reset-token");

      await authService.forgotPassword("test@test.com");

      expect(mockEmailQueue.enqueueVerifyEmail).toHaveBeenCalled();
    });
  });

  describe("changePassword", () => {
    it("updates password", async () => {
      mockTokenService.validateVerifyToken.mockResolvedValue({
        email: "test@test.com",
      });

      mockUserRepository.findByEmail.mockResolvedValue({
        id: 1,
        email: "test@test.com",
      });

      jest
        .spyOn<any, any>(authService as any, "hashPassword")
        .mockResolvedValue("new-hash");

      await authService.changePassword("token", "newpass");

      expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
        password: "new-hash",
      });
    });
  });

  describe("microsoftOAuth", () => {
    it("creates user if missing", async () => {
      mockOAuthService.verifyMicrosoftToken.mockResolvedValue({
        sub: "ms-sub",
        email: "test@test.com",
      });

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({
        id: 1,
        email: "test@test.com",
        role: "notdefined",
      });

      mockTokenService.generateTokens.mockResolvedValue({
        accessToken: "a",
        refreshToken: "b",
      });

      const res = await authService.microsoftOAuth("ms-token");

      expect(res.accessToken).toBe("a");
    });
  });

  describe("googleOAuth", () => {
    it("creates user if missing", async () => {
      mockOAuthService.verifyGoogleToken.mockResolvedValue({
        email: "test@test.com",
        sub: "google-sub",
      });

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue({ id: 1 });

      mockTokenService.generateTokens.mockResolvedValue({
        accessToken: "a",
        refreshToken: "b",
      });

      const res = await authService.googleOAuth("google-token");

      expect(res.accessToken).toBe("a");
    });
  });

  describe("generateNewTokens", () => {
    it("rotates refresh token", async () => {
      mockTokenService.rotateRefreshToken.mockResolvedValue({
        accessToken: "newAccess",
        refreshToken: "newRefresh",
        role: "student",
        username: "Tom",
        avatar: "avatar.png",
      });

      const res = await authService.generateNewTokens("old");

      expect(res.accessToken).toBe("newAccess");
    });
  });

  describe("authLogout", () => {
    it("logs out user", async () => {
      mockTokenService.logoutToken.mockResolvedValue(true);

      const res = await authService.authLogout("token");

      expect(res).toBe(true);
    });
  });
});
