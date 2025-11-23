import { AuthService } from "../../service/authService";
import { HttpError } from "../../utility/httpUtility";

describe("AuthService", () => {
  let authService: AuthService;

  const mockUserRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  const mockEmailService = {
    sendVerificationEmail: jest.fn(),
    sendWelcomeEmail: jest.fn(),
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

    authService = new AuthService(
      mockUserRepository as any,
      mockEmailService as any,
      mockTokenService as any,
      mockOAuthService as any,
      mockWebService as any,
    );
  });

  describe("loginUser", () => {
    it("logs in a user successfully", async () => {
      mockWebService.verifyGoogleCaptcha.mockResolvedValue(true);
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 1,
        email: "test@test.com",
        password: "$2b$10$abcdef", // mock hash
        role: "student",
        username: "TestUser",
      });

      jest
        .spyOn<any, any>(authService as any, "comparePassword")
        .mockResolvedValue(true);

      mockTokenService.generateTokens.mockResolvedValue({
        accessToken: "jwt-access",
        refreshToken: "jwt-refresh",
      });

      const result = await authService.loginUser(
        "test@test.com",
        "123456",
        false,
        "captcha",
      );

      expect(result).toEqual({
        accessToken: "jwt-access",
        refreshToken: "jwt-refresh",
        role: "student",
        id: 1,
        username: "TestUser",
        avatar: undefined,
      });
    });

    it("throws 401 on invalid password", async () => {
      mockWebService.verifyGoogleCaptcha.mockResolvedValue(true);
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 1,
        email: "test@test.com",
        password: "$2b$10$abcdef",
      });

      jest
        .spyOn<any, any>(authService as any, "comparePassword")
        .mockResolvedValue(false);

      await expect(
        authService.loginUser("test@test.com", "wrongpass", false, "captcha"),
      ).rejects.toBeInstanceOf(HttpError);
    });

    it("throws 401 when captcha verification fails", async () => {
      mockWebService.verifyGoogleCaptcha.mockResolvedValue(false);

      await expect(
        authService.loginUser(
          "test@test.com",
          "password",
          false,
          "bad-captcha",
        ),
      ).rejects.toBeInstanceOf(HttpError);

      expect(mockWebService.verifyGoogleCaptcha).toHaveBeenCalled();
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    });

    it("throws 401 when user exists but has no password (OAuth account)", async () => {
      mockWebService.verifyGoogleCaptcha.mockResolvedValue(true);

      mockUserRepository.findByEmail.mockResolvedValue({
        id: 1,
        email: "oauth@test.com",
        password: null,
        role: "student",
      });

      jest
        .spyOn<any, any>(authService as any, "comparePassword")
        .mockResolvedValue(false);

      await expect(
        authService.loginUser("oauth@test.com", "somepass", false, "captcha"),
      ).rejects.toBeInstanceOf(HttpError);
    });
  });

  describe("signupUser", () => {
    it("creates a signup verification token and sends email", async () => {
      mockWebService.verifyGoogleCaptcha.mockResolvedValue(true);
      mockUserRepository.findByEmail.mockResolvedValue(undefined);

      jest
        .spyOn<any, any>(authService as any, "hashPassword")
        .mockResolvedValue("hashed");
      mockTokenService.createVerifyToken.mockResolvedValue("verify-token");

      mockEmailService.sendVerificationEmail.mockResolvedValue(undefined);

      const result = await authService.signupUser(
        "test@test.com",
        "pass",
        "student",
        "captcha",
      );

      expect(result).toBe(true);
      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it("throws 409 when email already exists", async () => {
      mockWebService.verifyGoogleCaptcha.mockResolvedValue(true);
      mockUserRepository.findByEmail.mockResolvedValue({
        email: "test@test.com",
      });

      await expect(
        authService.signupUser("test@test.com", "pass", "student", "captcha"),
      ).rejects.toBeInstanceOf(HttpError);
    });
  });

  describe("verifyUser", () => {
    it("creates the user after token verification", async () => {
      mockTokenService.validateVerifyToken.mockResolvedValue({
        email: "test@test.com",
        password: "hashedPass",
        role: "student",
      });

      mockUserRepository.create.mockResolvedValue({ id: 1 });

      const result = await authService.verifyUser("token123");

      expect(result).toEqual({ id: 1 });
    });

    it("throws 500 when token verification fails", async () => {
      mockTokenService.validateVerifyToken.mockRejectedValue(
        new Error("Invalid token"),
      );

      await expect(authService.verifyUser("badToken")).rejects.toBeInstanceOf(
        Error,
      );

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it("sends a welcome email after successful verification", async () => {
      mockTokenService.validateVerifyToken.mockResolvedValue({
        email: "new@test.com",
        password: "hashedPass",
        role: "student",
      });

      mockUserRepository.create.mockResolvedValue({ id: 1 });
      mockEmailService.sendWelcomeEmail.mockResolvedValue(undefined);

      const result = await authService.verifyUser("token");

      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
        "new@test.com",
      );
      expect(result).toEqual({ id: 1 });
    });

    it("throws 500 if user creation fails", async () => {
      mockTokenService.validateVerifyToken.mockResolvedValue({
        email: "x@test.com",
        password: "abc",
        role: "student",
      });

      mockUserRepository.create.mockRejectedValue(new Error("DB failure"));

      await expect(authService.verifyUser("token")).rejects.toBeInstanceOf(
        Error,
      );

      expect(mockEmailService.sendWelcomeEmail).not.toHaveBeenCalled();
    });
  });

  // --------------------------------------------------
  // FORGOT PASSWORD
  // --------------------------------------------------
  describe("forgotPassword", () => {
    it("does nothing if user does not exist", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(undefined);

      await authService.forgotPassword("missing@test.com");

      expect(mockEmailService.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it("does nothing for OAuth accounts", async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        email: "test@test.com",
        provider: "google",
      });

      await authService.forgotPassword("test@test.com");

      expect(mockEmailService.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it("sends reset email for valid local account", async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        email: "test@test.com",
        provider: "local",
      });

      mockTokenService.createVerifyToken.mockResolvedValue("reset-token");

      await authService.forgotPassword("test@test.com");

      expect(mockEmailService.sendVerificationEmail).toHaveBeenCalled();
    });
  });

  // --------------------------------------------------
  // CHANGE PASSWORD
  // --------------------------------------------------
  describe("changePassword", () => {
    it("updates the user's password", async () => {
      mockTokenService.validateVerifyToken.mockResolvedValue({
        email: "test@test.com",
      });

      mockUserRepository.findByEmail.mockResolvedValue({
        id: 1,
        email: "test@test.com",
      });

      mockUserRepository.update.mockResolvedValue(true);

      jest
        .spyOn<any, any>(authService as any, "hashPassword")
        .mockResolvedValue("hashedPass");

      await authService.changePassword("token123", "newpass");

      expect(mockUserRepository.update).toHaveBeenCalledWith(1, "hashedPass");
    });

    it("throws 404 if user not found", async () => {
      mockTokenService.validateVerifyToken.mockResolvedValue({
        email: "x@test.com",
      });
      mockUserRepository.findByEmail.mockResolvedValue(undefined);

      await expect(
        authService.changePassword("token", "pass"),
      ).rejects.toBeInstanceOf(HttpError);
    });
  });

  // --------------------------------------------------
  // MICROSOFT OAUTH
  // --------------------------------------------------
  describe("microsoftOAuth", () => {
    it("creates a new user if none exists", async () => {
      mockOAuthService.verifyMicrosoftToken.mockResolvedValue({
        sub: "sub123",
        email: "test@test.com",
        name: "John",
      });

      mockUserRepository.findByEmail.mockResolvedValue(undefined);
      mockUserRepository.create.mockResolvedValue({
        id: 1,
        email: "test@test.com",
        role: "notdefined",
      });

      mockTokenService.generateTokens.mockResolvedValue({
        accessToken: "access",
        refreshToken: "refresh",
      });

      const result = await authService.microsoftOAuth("microsoftToken123");

      expect(result.accessToken).toBe("access");
      expect(mockUserRepository.create).toHaveBeenCalled();
    });
  });

  // --------------------------------------------------
  // GOOGLE OAUTH
  // --------------------------------------------------
  describe("googleOAuth", () => {
    it("creates a new user if none exists", async () => {
      mockOAuthService.verifyGoogleToken.mockResolvedValue({
        email: "test@test.com",
        sub: "googleSub123",
      });

      mockUserRepository.findByEmail.mockResolvedValue(undefined);
      mockUserRepository.create.mockResolvedValue({
        id: 1,
        email: "test@test.com",
      });

      mockTokenService.generateTokens.mockResolvedValue({
        accessToken: "a",
        refreshToken: "b",
      });

      const res = await authService.googleOAuth("token");
      expect(res.accessToken).toBe("a");
    });
  });

  // --------------------------------------------------
  // GENERATE NEW TOKENS
  // --------------------------------------------------
  describe("generateNewTokens", () => {
    it("successfully rotates refresh token and returns new tokens", async () => {
      mockTokenService.rotateRefreshToken.mockResolvedValue({
        accessToken: "newAccess",
        refreshToken: "newRefresh",
        role: "student",
        username: "Tom",
        avatar: "avatar.png",
      });

      const result = await authService.generateNewTokens("oldRefresh");

      expect(result).toEqual({
        accessToken: "newAccess",
        refreshToken: "newRefresh",
        role: "student",
        username: "Tom",
        avatar: "avatar.png",
      });

      expect(mockTokenService.rotateRefreshToken).toHaveBeenCalledWith(
        "oldRefresh",
      );
    });

    it("throws 500 if rotateRefreshToken rejects", async () => {
      mockTokenService.rotateRefreshToken.mockRejectedValue(
        new Error("Token expired"),
      );

      await expect(
        authService.generateNewTokens("expiredToken"),
      ).rejects.toBeInstanceOf(Error);
    });

    it("propagates HttpError thrown by rotateRefreshToken", async () => {
      const httpErr = new HttpError(401, "Invalid refresh token");
      mockTokenService.rotateRefreshToken.mockRejectedValue(httpErr);

      await expect(authService.generateNewTokens("badToken")).rejects.toBe(
        httpErr,
      );
    });
  });

  describe("authLogout", () => {
    it("invalidates token", async () => {
      mockTokenService.logoutToken.mockResolvedValue(true);

      const result = await authService.authLogout("token");
      expect(result).toBe(true);
    });
  });
});
