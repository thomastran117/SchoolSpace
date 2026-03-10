using backend.app.dtos.responses.auth;
using backend.app.errors.app;
using backend.app.errors.http;
using backend.app.models.core;
using backend.app.models.other;
using backend.app.repositories.interfaces;
using backend.app.services.implementations;
using backend.app.services.interfaces;
using backend.app.utilities.interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace backend.tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly Mock<ITokenService> _tokenService = new();
    private readonly Mock<IOAuthService> _oauthService = new();
    private readonly Mock<ICaptchaService> _captchaService = new();
    private readonly Mock<ICustomLogger> _logger = new();
    private readonly AuthService _sut;

    // BCrypt hash computed once for the suite — avoids per-test hashing overhead
    private const string TestPassword = "Password@Test1";
    private static readonly string TestPasswordHash = BCrypt.Net.BCrypt.HashPassword(TestPassword);

    public AuthServiceTests()
    {
        _sut = new AuthService(
            _userRepo.Object,
            _tokenService.Object,
            _oauthService.Object,
            _captchaService.Object,
            _logger.Object
        );
    }

    // -------------------------------------------------------------------------
    // Fixtures
    // -------------------------------------------------------------------------

    private static User MakeUser(
        int id = 1,
        string email = "user@example.com",
        UserRole role = UserRole.Student,
        UserStatus status = UserStatus.Active,
        string? password = null
    ) => new()
    {
        Id = id,
        Email = email,
        Password = password ?? TestPasswordHash,
        Usertype = role,
        Status = status,
        Username = email,
    };

    private static OAuthUser MakeOAuthUser(
        string id = "oauth-id",
        string email = "oauth@example.com",
        string name = "OAuth User",
        string provider = "google"
    ) => new(id, email, name, provider);

    private void SetupBuildAuthResult(string access = "access-token", string refresh = "refresh-token")
    {
        _tokenService.Setup(t => t.GenerateAccessToken(It.IsAny<User>())).Returns(access);
        _tokenService.Setup(t => t.GenerateRefreshToken(It.IsAny<int>())).ReturnsAsync(refresh);
    }

    private void SetupCaptcha(bool passes) =>
        _captchaService
            .Setup(c => c.VerifyCaptchaAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(passes);

    // =========================================================================
    // LoginAsync
    // =========================================================================

    [Fact]
    public async Task LoginAsync_WhenCaptchaFails_ThrowsUnauthorizedException()
    {
        SetupCaptcha(passes: false);

        await _sut.Invoking(s => s.LoginAsync("user@example.com", TestPassword, "bad-captcha"))
                  .Should().ThrowAsync<UnauthorizedException>();
    }

    [Fact]
    public async Task LoginAsync_WhenUserNotFound_ThrowsInvalidCredentialsException()
    {
        SetupCaptcha(passes: true);
        _userRepo.Setup(r => r.GetUserByEmailAsync("user@example.com")).ReturnsAsync((User?)null);

        await _sut.Invoking(s => s.LoginAsync("user@example.com", TestPassword, "captcha"))
                  .Should().ThrowAsync<InvalidCredentialsException>();
    }

    [Fact]
    public async Task LoginAsync_WhenUserPasswordIsNull_ThrowsInvalidCredentialsException()
    {
        SetupCaptcha(passes: true);
        var user = MakeUser(password: null);
        user.Password = null;
        _userRepo.Setup(r => r.GetUserByEmailAsync(user.Email)).ReturnsAsync(user);

        await _sut.Invoking(s => s.LoginAsync(user.Email, TestPassword, "captcha"))
                  .Should().ThrowAsync<InvalidCredentialsException>();
    }

    [Fact]
    public async Task LoginAsync_WhenPasswordIsWrong_ThrowsInvalidCredentialsException()
    {
        SetupCaptcha(passes: true);
        _userRepo.Setup(r => r.GetUserByEmailAsync("user@example.com")).ReturnsAsync(MakeUser());

        await _sut.Invoking(s => s.LoginAsync("user@example.com", "WrongPassword!", "captcha"))
                  .Should().ThrowAsync<InvalidCredentialsException>();
    }

    [Theory]
    [InlineData(UserStatus.Inactive)]
    [InlineData(UserStatus.SoftDelete)]
    public async Task LoginAsync_WhenUserStatusIsNotActive_ThrowsUserNotActiveException(UserStatus status)
    {
        SetupCaptcha(passes: true);
        _userRepo.Setup(r => r.GetUserByEmailAsync("user@example.com"))
                 .ReturnsAsync(MakeUser(status: status));

        await _sut.Invoking(s => s.LoginAsync("user@example.com", TestPassword, "captcha"))
                  .Should().ThrowAsync<UserNotActiveException>();
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ReturnsAuthResult()
    {
        SetupCaptcha(passes: true);
        SetupBuildAuthResult();
        _userRepo.Setup(r => r.GetUserByEmailAsync("user@example.com")).ReturnsAsync(MakeUser());

        var result = await _sut.LoginAsync("user@example.com", TestPassword, "captcha");

        result.Should().NotBeNull();
        result!.AccessToken.Should().Be("access-token");
        result!.RefreshToken.Should().Be("refresh-token");
    }

    [Fact]
    public async Task LoginAsync_AuthResult_ContainsCorrectUserInfo()
    {
        SetupCaptcha(passes: true);
        SetupBuildAuthResult();
        var user = MakeUser(id: 42, email: "teacher@school.com", role: UserRole.Teacher);
        _userRepo.Setup(r => r.GetUserByEmailAsync(user.Email)).ReturnsAsync(user);

        var result = await _sut.LoginAsync(user.Email, TestPassword, "captcha");

        result!.UserId.Should().Be(42);
        result!.Username.Should().Be("teacher@school.com");
        result!.Role.Should().Be("Teacher");
    }

    [Fact]
    public async Task LoginAsync_WhenRepositoryThrows_ThrowsInternalServerErrorException()
    {
        SetupCaptcha(passes: true);
        _userRepo.Setup(r => r.GetUserByEmailAsync(It.IsAny<string>()))
                 .ThrowsAsync(new Exception("db error"));

        await _sut.Invoking(s => s.LoginAsync("user@example.com", TestPassword, "captcha"))
                  .Should().ThrowAsync<InternalServerErrorException>();
    }

    // =========================================================================
    // SignupAsync
    // =========================================================================

    [Fact]
    public async Task SignupAsync_WhenEmailAlreadyExists_ThrowsEmailAlreadyExistsException()
    {
        _userRepo.Setup(r => r.EmailExistsAsync("existing@example.com")).ReturnsAsync(true);

        await _sut.Invoking(s => s.SignupAsync("existing@example.com", TestPassword, "student", "captcha"))
                  .Should().ThrowAsync<EmailAlreadyExistsException>();
    }

    [Theory]
    [InlineData("teacher", UserRole.Teacher)]
    [InlineData("assistant", UserRole.Admin)]
    [InlineData("student", UserRole.Student)]
    [InlineData("unknown", UserRole.Student)]
    public async Task SignupAsync_MapsRoleCorrectly(string roleInput, UserRole expectedRole)
    {
        _userRepo.Setup(r => r.EmailExistsAsync(It.IsAny<string>())).ReturnsAsync(false);
        _userRepo.Setup(r => r.CreateUserAsync(It.IsAny<User>())).ReturnsAsync((User u) => u);
        _tokenService.Setup(t => t.GenerateVerificationToken(It.IsAny<User>())).ReturnsAsync("token");

        await _sut.SignupAsync("user@example.com", TestPassword, roleInput, "captcha");

        _userRepo.Verify(r => r.CreateUserAsync(
            It.Is<User>(u => u.Usertype == expectedRole)),
            Times.Once);
    }

    [Fact]
    public async Task SignupAsync_CreatesUserWithInactiveStatus()
    {
        _userRepo.Setup(r => r.EmailExistsAsync(It.IsAny<string>())).ReturnsAsync(false);
        _userRepo.Setup(r => r.CreateUserAsync(It.IsAny<User>())).ReturnsAsync((User u) => u);
        _tokenService.Setup(t => t.GenerateVerificationToken(It.IsAny<User>())).ReturnsAsync("token");

        await _sut.SignupAsync("user@example.com", TestPassword, "student", "captcha");

        _userRepo.Verify(r => r.CreateUserAsync(
            It.Is<User>(u => u.Status == UserStatus.Inactive)),
            Times.Once);
    }

    [Fact]
    public async Task SignupAsync_StoresHashedPassword_NotPlaintext()
    {
        User? captured = null;
        _userRepo.Setup(r => r.EmailExistsAsync(It.IsAny<string>())).ReturnsAsync(false);
        _userRepo.Setup(r => r.CreateUserAsync(It.IsAny<User>()))
                 .Callback<User>(u => captured = u)
                 .ReturnsAsync((User u) => u);
        _tokenService.Setup(t => t.GenerateVerificationToken(It.IsAny<User>())).ReturnsAsync("token");

        await _sut.SignupAsync("user@example.com", TestPassword, "student", "captcha");

        captured!.Password.Should().NotBe(TestPassword);
        BCrypt.Net.BCrypt.Verify(TestPassword, captured.Password).Should().BeTrue();
    }

    [Fact]
    public async Task SignupAsync_GeneratesVerificationTokenAfterCreatingUser()
    {
        var created = MakeUser();
        _userRepo.Setup(r => r.EmailExistsAsync(It.IsAny<string>())).ReturnsAsync(false);
        _userRepo.Setup(r => r.CreateUserAsync(It.IsAny<User>())).ReturnsAsync(created);
        _tokenService.Setup(t => t.GenerateVerificationToken(created)).ReturnsAsync("verify-token");

        await _sut.SignupAsync("user@example.com", TestPassword, "student", "captcha");

        _tokenService.Verify(t => t.GenerateVerificationToken(created), Times.Once);
    }

    [Fact]
    public async Task SignupAsync_ReturnsTrue()
    {
        _userRepo.Setup(r => r.EmailExistsAsync(It.IsAny<string>())).ReturnsAsync(false);
        _userRepo.Setup(r => r.CreateUserAsync(It.IsAny<User>())).ReturnsAsync((User u) => u);
        _tokenService.Setup(t => t.GenerateVerificationToken(It.IsAny<User>())).ReturnsAsync("token");

        var result = await _sut.SignupAsync("user@example.com", TestPassword, "student", "captcha");

        result.Should().BeTrue();
    }

    [Fact]
    public async Task SignupAsync_WhenRepositoryThrows_ThrowsInternalServerErrorException()
    {
        _userRepo.Setup(r => r.EmailExistsAsync(It.IsAny<string>())).ReturnsAsync(false);
        _userRepo.Setup(r => r.CreateUserAsync(It.IsAny<User>())).ThrowsAsync(new Exception("db error"));

        await _sut.Invoking(s => s.SignupAsync("user@example.com", TestPassword, "student", "captcha"))
                  .Should().ThrowAsync<InternalServerErrorException>();
    }

    // =========================================================================
    // VerifyAsync
    // =========================================================================

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task VerifyAsync_WhenTokenIsBlankOrNull_ThrowsInvalidOrExpiredVerificationTokenException(string? token)
    {
        await _sut.Invoking(s => s.VerifyAsync(token!))
                  .Should().ThrowAsync<InvalidOrExpiredVerificationTokenException>();
    }

    [Fact]
    public async Task VerifyAsync_WhenTokenNotFound_ThrowsInvalidOrExpiredVerificationTokenException()
    {
        _tokenService.Setup(t => t.VerifyVerificationToken("bad-token")).ReturnsAsync((int?)null);

        await _sut.Invoking(s => s.VerifyAsync("bad-token"))
                  .Should().ThrowAsync<InvalidOrExpiredVerificationTokenException>();
    }

    [Fact]
    public async Task VerifyAsync_WhenUserNotFound_ThrowsResourceNotFoundException()
    {
        _tokenService.Setup(t => t.VerifyVerificationToken("valid-token")).ReturnsAsync(99);
        _userRepo.Setup(r => r.GetUserAsync(99)).ReturnsAsync((User?)null);

        await _sut.Invoking(s => s.VerifyAsync("valid-token"))
                  .Should().ThrowAsync<ResourceNotFoundException>();
    }

    [Fact]
    public async Task VerifyAsync_WithValidToken_ReturnsAuthResult()
    {
        SetupBuildAuthResult();
        _tokenService.Setup(t => t.VerifyVerificationToken("valid-token")).ReturnsAsync(1);
        _userRepo.Setup(r => r.GetUserAsync(1)).ReturnsAsync(MakeUser());

        var result = await _sut.VerifyAsync("valid-token");

        result.Should().NotBeNull();
        result!.AccessToken.Should().Be("access-token");
        result!.RefreshToken.Should().Be("refresh-token");
    }

    [Fact]
    public async Task VerifyAsync_WhenRepositoryThrows_ThrowsInternalServerErrorException()
    {
        _tokenService.Setup(t => t.VerifyVerificationToken("valid-token")).ReturnsAsync(1);
        _userRepo.Setup(r => r.GetUserAsync(1)).ThrowsAsync(new Exception("db error"));

        await _sut.Invoking(s => s.VerifyAsync("valid-token"))
                  .Should().ThrowAsync<InternalServerErrorException>();
    }

    // =========================================================================
    // ForgotPasswordAsync
    // =========================================================================

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task ForgotPasswordAsync_WhenEmailIsBlankOrNull_ReturnsFalse(string? email)
    {
        var result = await _sut.ForgotPasswordAsync(email!);

        result.Should().BeFalse();
    }

    [Fact]
    public async Task ForgotPasswordAsync_WhenUserNotFound_ReturnsFalse()
    {
        _userRepo.Setup(r => r.GetUserByEmailAsync("unknown@example.com")).ReturnsAsync((User?)null);

        var result = await _sut.ForgotPasswordAsync("unknown@example.com");

        result.Should().BeFalse();
    }

    [Fact]
    public async Task ForgotPasswordAsync_WhenUserFound_GeneratesVerificationToken()
    {
        var user = MakeUser();
        _userRepo.Setup(r => r.GetUserByEmailAsync(user.Email)).ReturnsAsync(user);
        _tokenService.Setup(t => t.GenerateVerificationToken(user)).ReturnsAsync("reset-token");

        await _sut.ForgotPasswordAsync(user.Email);

        _tokenService.Verify(t => t.GenerateVerificationToken(user), Times.Once);
    }

    [Fact]
    public async Task ForgotPasswordAsync_WhenUserFound_ReturnsTrue()
    {
        var user = MakeUser();
        _userRepo.Setup(r => r.GetUserByEmailAsync(user.Email)).ReturnsAsync(user);
        _tokenService.Setup(t => t.GenerateVerificationToken(It.IsAny<User>())).ReturnsAsync("reset-token");

        var result = await _sut.ForgotPasswordAsync(user.Email);

        result.Should().BeTrue();
    }

    [Fact]
    public async Task ForgotPasswordAsync_WhenRepositoryThrows_ThrowsInternalServerErrorException()
    {
        _userRepo.Setup(r => r.GetUserByEmailAsync(It.IsAny<string>()))
                 .ThrowsAsync(new Exception("db error"));

        await _sut.Invoking(s => s.ForgotPasswordAsync("user@example.com"))
                  .Should().ThrowAsync<InternalServerErrorException>();
    }

    // =========================================================================
    // ChangePasswordAsync
    // =========================================================================

    [Theory]
    [InlineData("", "NewPassword@1")]
    [InlineData("   ", "NewPassword@1")]
    [InlineData("token", "")]
    [InlineData("token", "   ")]
    public async Task ChangePasswordAsync_WhenTokenOrPasswordIsBlank_ThrowsInvalidOrExpiredVerificationTokenException(
        string token, string newPassword)
    {
        await _sut.Invoking(s => s.ChangePasswordAsync(token, newPassword))
                  .Should().ThrowAsync<InvalidOrExpiredVerificationTokenException>();
    }

    [Fact]
    public async Task ChangePasswordAsync_WhenTokenNotFound_ThrowsInvalidOrExpiredVerificationTokenException()
    {
        _tokenService.Setup(t => t.VerifyVerificationToken("bad-token")).ReturnsAsync((int?)null);

        await _sut.Invoking(s => s.ChangePasswordAsync("bad-token", "NewPassword@1"))
                  .Should().ThrowAsync<InvalidOrExpiredVerificationTokenException>();
    }

    [Fact]
    public async Task ChangePasswordAsync_WhenUserNotFound_ThrowsResourceNotFoundException()
    {
        _tokenService.Setup(t => t.VerifyVerificationToken("valid-token")).ReturnsAsync(99);
        _userRepo.Setup(r => r.GetUserAsync(99)).ReturnsAsync((User?)null);

        await _sut.Invoking(s => s.ChangePasswordAsync("valid-token", "NewPassword@1"))
                  .Should().ThrowAsync<ResourceNotFoundException>();
    }

    [Fact]
    public async Task ChangePasswordAsync_WhenUpdateSucceeds_ReturnsTrue()
    {
        var user = MakeUser();
        _tokenService.Setup(t => t.VerifyVerificationToken("valid-token")).ReturnsAsync(user.Id);
        _userRepo.Setup(r => r.GetUserAsync(user.Id)).ReturnsAsync(user);
        _userRepo.Setup(r => r.UpdatePartialAsync(It.IsAny<User>())).ReturnsAsync(user);

        var result = await _sut.ChangePasswordAsync("valid-token", "NewPassword@1");

        result.Should().BeTrue();
    }

    [Fact]
    public async Task ChangePasswordAsync_WhenUpdateReturnsNull_ReturnsFalse()
    {
        var user = MakeUser();
        _tokenService.Setup(t => t.VerifyVerificationToken("valid-token")).ReturnsAsync(user.Id);
        _userRepo.Setup(r => r.GetUserAsync(user.Id)).ReturnsAsync(user);
        _userRepo.Setup(r => r.UpdatePartialAsync(It.IsAny<User>())).ReturnsAsync((User?)null);

        var result = await _sut.ChangePasswordAsync("valid-token", "NewPassword@1");

        result.Should().BeFalse();
    }

    [Fact]
    public async Task ChangePasswordAsync_SavesNewHashedPassword()
    {
        const string newPassword = "NewPassword@1";
        User? updated = null;
        var user = MakeUser();
        _tokenService.Setup(t => t.VerifyVerificationToken("valid-token")).ReturnsAsync(user.Id);
        _userRepo.Setup(r => r.GetUserAsync(user.Id)).ReturnsAsync(user);
        _userRepo.Setup(r => r.UpdatePartialAsync(It.IsAny<User>()))
                 .Callback<User>(u => updated = u)
                 .ReturnsAsync(user);

        await _sut.ChangePasswordAsync("valid-token", newPassword);

        updated!.Password.Should().NotBe(newPassword);
        BCrypt.Net.BCrypt.Verify(newPassword, updated.Password).Should().BeTrue();
    }

    [Fact]
    public async Task ChangePasswordAsync_WhenRepositoryThrows_ThrowsInternalServerErrorException()
    {
        _tokenService.Setup(t => t.VerifyVerificationToken("valid-token")).ReturnsAsync(1);
        _userRepo.Setup(r => r.GetUserAsync(1)).ThrowsAsync(new Exception("db error"));

        await _sut.Invoking(s => s.ChangePasswordAsync("valid-token", "NewPassword@1"))
                  .Should().ThrowAsync<InternalServerErrorException>();
    }

    // =========================================================================
    // RefreshAsync
    // =========================================================================

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task RefreshAsync_WhenTokenIsBlankOrNull_ThrowsInvalidOrExpiredRefreshTokenException(string? token)
    {
        await _sut.Invoking(s => s.RefreshAsync(token!))
                  .Should().ThrowAsync<InvalidOrExpiredRefreshTokenException>();
    }

    [Fact]
    public async Task RefreshAsync_WhenRotateReturnsNull_ThrowsInvalidOrExpiredRefreshTokenException()
    {
        _tokenService.Setup(t => t.RotateRefreshTokenAsync("stale-token"))
                     .ReturnsAsync(((string, int)?)null);

        await _sut.Invoking(s => s.RefreshAsync("stale-token"))
                  .Should().ThrowAsync<InvalidOrExpiredRefreshTokenException>();
    }

    [Fact]
    public async Task RefreshAsync_WhenUserNotFound_ThrowsResourceNotFoundException()
    {
        _tokenService.Setup(t => t.RotateRefreshTokenAsync("valid-token"))
                     .ReturnsAsync(("new-refresh", 99));
        _userRepo.Setup(r => r.GetUserAsync(99)).ReturnsAsync((User?)null);

        await _sut.Invoking(s => s.RefreshAsync("valid-token"))
                  .Should().ThrowAsync<ResourceNotFoundException>();
    }

    [Theory]
    [InlineData(UserStatus.Inactive)]
    [InlineData(UserStatus.SoftDelete)]
    public async Task RefreshAsync_WhenUserIsNotActive_ThrowsUserNotActiveException(UserStatus status)
    {
        var user = MakeUser(status: status);
        _tokenService.Setup(t => t.RotateRefreshTokenAsync("valid-token"))
                     .ReturnsAsync(("new-refresh", user.Id));
        _userRepo.Setup(r => r.GetUserAsync(user.Id)).ReturnsAsync(user);

        await _sut.Invoking(s => s.RefreshAsync("valid-token"))
                  .Should().ThrowAsync<UserNotActiveException>();
    }

    [Fact]
    public async Task RefreshAsync_ReturnsAuthResultWithNewTokens()
    {
        var user = MakeUser(id: 5);
        _tokenService.Setup(t => t.RotateRefreshTokenAsync("old-token"))
                     .ReturnsAsync(("new-refresh-token", user.Id));
        _userRepo.Setup(r => r.GetUserAsync(user.Id)).ReturnsAsync(user);
        _tokenService.Setup(t => t.GenerateAccessToken(user)).Returns("new-access-token");

        var result = await _sut.RefreshAsync("old-token");

        result.Should().NotBeNull();
        result!.AccessToken.Should().Be("new-access-token");
        result!.RefreshToken.Should().Be("new-refresh-token");
        result!.UserId.Should().Be(5);
    }

    [Fact]
    public async Task RefreshAsync_WhenRepositoryThrows_ThrowsInternalServerErrorException()
    {
        _tokenService.Setup(t => t.RotateRefreshTokenAsync("valid-token"))
                     .ReturnsAsync(("new-refresh", 1));
        _userRepo.Setup(r => r.GetUserAsync(1)).ThrowsAsync(new Exception("db error"));

        await _sut.Invoking(s => s.RefreshAsync("valid-token"))
                  .Should().ThrowAsync<InternalServerErrorException>();
    }

    // =========================================================================
    // LogoutAsync
    // =========================================================================

    [Fact]
    public async Task LogoutAsync_WhenTokenIsValid_ReturnsTrue()
    {
        _tokenService.Setup(t => t.InvalidateRefreshTokenAsync("valid-token")).ReturnsAsync(true);

        var result = await _sut.LogoutAsync("valid-token");

        result.Should().BeTrue();
    }

    [Fact]
    public async Task LogoutAsync_WhenTokenNotFound_ReturnsFalse()
    {
        _tokenService.Setup(t => t.InvalidateRefreshTokenAsync("unknown-token")).ReturnsAsync(false);

        var result = await _sut.LogoutAsync("unknown-token");

        result.Should().BeFalse();
    }

    [Fact]
    public async Task LogoutAsync_WhenTokenServiceThrows_ThrowsInternalServerErrorException()
    {
        _tokenService.Setup(t => t.InvalidateRefreshTokenAsync(It.IsAny<string>()))
                     .ThrowsAsync(new Exception("cache error"));

        await _sut.Invoking(s => s.LogoutAsync("any-token"))
                  .Should().ThrowAsync<InternalServerErrorException>();
    }

    // =========================================================================
    // LoginWithGoogleAsync
    // =========================================================================

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task LoginWithGoogleAsync_WhenTokenIsBlankOrNull_ThrowsInvalidCredentialsException(string? token)
    {
        await _sut.Invoking(s => s.LoginWithGoogleAsync(token!))
                  .Should().ThrowAsync<InvalidCredentialsException>();
    }

    [Fact]
    public async Task LoginWithGoogleAsync_WhenUserFoundByGoogleId_ReturnsAuthResultWithoutCreatingUser()
    {
        SetupBuildAuthResult();
        var oauthUser = MakeOAuthUser();
        _oauthService.Setup(o => o.VerifyGoogleTokenAsync("google-token")).ReturnsAsync(oauthUser);
        _userRepo.Setup(r => r.GetUserByGoogleIdAsync(oauthUser.Id)).ReturnsAsync(MakeUser());

        var result = await _sut.LoginWithGoogleAsync("google-token");

        result.Should().NotBeNull();
        _userRepo.Verify(r => r.CreateUserAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task LoginWithGoogleAsync_WhenUserFoundByEmailOnly_LinksGoogleId()
    {
        SetupBuildAuthResult();
        var oauthUser = MakeOAuthUser(id: "gid-123");
        var user = MakeUser();
        _oauthService.Setup(o => o.VerifyGoogleTokenAsync("google-token")).ReturnsAsync(oauthUser);
        _userRepo.Setup(r => r.GetUserByGoogleIdAsync(oauthUser.Id)).ReturnsAsync((User?)null);
        _userRepo.Setup(r => r.GetUserByEmailAsync(oauthUser.Email)).ReturnsAsync(user);
        _userRepo.Setup(r => r.UpdateProviderIdsAsync(user.Id, oauthUser.Id, null)).ReturnsAsync(user);

        await _sut.LoginWithGoogleAsync("google-token");

        _userRepo.Verify(r => r.UpdateProviderIdsAsync(user.Id, "gid-123", null), Times.Once);
        _userRepo.Verify(r => r.CreateUserAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task LoginWithGoogleAsync_WhenNewUser_CreatesActiveStudentAccount()
    {
        SetupBuildAuthResult();
        var oauthUser = MakeOAuthUser(id: "new-gid", email: "newuser@gmail.com", name: "New User");
        var created = MakeUser(email: oauthUser.Email);
        _oauthService.Setup(o => o.VerifyGoogleTokenAsync("google-token")).ReturnsAsync(oauthUser);
        _userRepo.Setup(r => r.GetUserByGoogleIdAsync(oauthUser.Id)).ReturnsAsync((User?)null);
        _userRepo.Setup(r => r.GetUserByEmailAsync(oauthUser.Email)).ReturnsAsync((User?)null);
        _userRepo.Setup(r => r.CreateUserAsync(It.IsAny<User>())).ReturnsAsync(created);

        await _sut.LoginWithGoogleAsync("google-token");

        _userRepo.Verify(r => r.CreateUserAsync(
            It.Is<User>(u =>
                u.Email == oauthUser.Email &&
                u.GoogleId == oauthUser.Id &&
                u.Status == UserStatus.Active &&
                u.Usertype == UserRole.Student)),
            Times.Once);
    }

    [Fact]
    public async Task LoginWithGoogleAsync_WhenUserIsInactive_ThrowsUserNotActiveException()
    {
        var oauthUser = MakeOAuthUser();
        _oauthService.Setup(o => o.VerifyGoogleTokenAsync("google-token")).ReturnsAsync(oauthUser);
        _userRepo.Setup(r => r.GetUserByGoogleIdAsync(oauthUser.Id))
                 .ReturnsAsync(MakeUser(status: UserStatus.Inactive));

        await _sut.Invoking(s => s.LoginWithGoogleAsync("google-token"))
                  .Should().ThrowAsync<UserNotActiveException>();
    }

    [Fact]
    public async Task LoginWithGoogleAsync_WhenOAuthServiceThrows_ThrowsInternalServerErrorException()
    {
        _oauthService.Setup(o => o.VerifyGoogleTokenAsync(It.IsAny<string>()))
                     .ThrowsAsync(new Exception("oauth error"));

        await _sut.Invoking(s => s.LoginWithGoogleAsync("google-token"))
                  .Should().ThrowAsync<InternalServerErrorException>();
    }

    // =========================================================================
    // LoginWithMicrosoftAsync
    // =========================================================================

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task LoginWithMicrosoftAsync_WhenTokenIsBlankOrNull_ThrowsInvalidCredentialsException(string? token)
    {
        await _sut.Invoking(s => s.LoginWithMicrosoftAsync(token!))
                  .Should().ThrowAsync<InvalidCredentialsException>();
    }

    [Fact]
    public async Task LoginWithMicrosoftAsync_WhenUserFoundByMicrosoftId_ReturnsAuthResultWithoutCreatingUser()
    {
        SetupBuildAuthResult();
        var oauthUser = MakeOAuthUser(provider: "microsoft");
        _oauthService.Setup(o => o.VerifyMicrosoftTokenAsync("ms-token")).ReturnsAsync(oauthUser);
        _userRepo.Setup(r => r.GetUserByMicrosoftIdAsync(oauthUser.Id)).ReturnsAsync(MakeUser());

        var result = await _sut.LoginWithMicrosoftAsync("ms-token");

        result.Should().NotBeNull();
        _userRepo.Verify(r => r.CreateUserAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task LoginWithMicrosoftAsync_WhenUserFoundByEmailOnly_LinksMicrosoftId()
    {
        SetupBuildAuthResult();
        var oauthUser = MakeOAuthUser(id: "msid-456", provider: "microsoft");
        var user = MakeUser();
        _oauthService.Setup(o => o.VerifyMicrosoftTokenAsync("ms-token")).ReturnsAsync(oauthUser);
        _userRepo.Setup(r => r.GetUserByMicrosoftIdAsync(oauthUser.Id)).ReturnsAsync((User?)null);
        _userRepo.Setup(r => r.GetUserByEmailAsync(oauthUser.Email)).ReturnsAsync(user);
        _userRepo.Setup(r => r.UpdateProviderIdsAsync(user.Id, null, oauthUser.Id)).ReturnsAsync(user);

        await _sut.LoginWithMicrosoftAsync("ms-token");

        _userRepo.Verify(r => r.UpdateProviderIdsAsync(user.Id, null, "msid-456"), Times.Once);
        _userRepo.Verify(r => r.CreateUserAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task LoginWithMicrosoftAsync_WhenNewUser_CreatesActiveStudentAccount()
    {
        SetupBuildAuthResult();
        var oauthUser = MakeOAuthUser(id: "new-msid", email: "new@microsoft.com", name: "New MS User", provider: "microsoft");
        var created = MakeUser(email: oauthUser.Email);
        _oauthService.Setup(o => o.VerifyMicrosoftTokenAsync("ms-token")).ReturnsAsync(oauthUser);
        _userRepo.Setup(r => r.GetUserByMicrosoftIdAsync(oauthUser.Id)).ReturnsAsync((User?)null);
        _userRepo.Setup(r => r.GetUserByEmailAsync(oauthUser.Email)).ReturnsAsync((User?)null);
        _userRepo.Setup(r => r.CreateUserAsync(It.IsAny<User>())).ReturnsAsync(created);

        await _sut.LoginWithMicrosoftAsync("ms-token");

        _userRepo.Verify(r => r.CreateUserAsync(
            It.Is<User>(u =>
                u.Email == oauthUser.Email &&
                u.MicrosoftId == oauthUser.Id &&
                u.Status == UserStatus.Active &&
                u.Usertype == UserRole.Student)),
            Times.Once);
    }

    [Fact]
    public async Task LoginWithMicrosoftAsync_WhenUserIsInactive_ThrowsUserNotActiveException()
    {
        var oauthUser = MakeOAuthUser(provider: "microsoft");
        _oauthService.Setup(o => o.VerifyMicrosoftTokenAsync("ms-token")).ReturnsAsync(oauthUser);
        _userRepo.Setup(r => r.GetUserByMicrosoftIdAsync(oauthUser.Id))
                 .ReturnsAsync(MakeUser(status: UserStatus.Inactive));

        await _sut.Invoking(s => s.LoginWithMicrosoftAsync("ms-token"))
                  .Should().ThrowAsync<UserNotActiveException>();
    }

    [Fact]
    public async Task LoginWithMicrosoftAsync_WhenOAuthServiceThrows_ThrowsInternalServerErrorException()
    {
        _oauthService.Setup(o => o.VerifyMicrosoftTokenAsync(It.IsAny<string>()))
                     .ThrowsAsync(new Exception("oauth error"));

        await _sut.Invoking(s => s.LoginWithMicrosoftAsync("ms-token"))
                  .Should().ThrowAsync<InternalServerErrorException>();
    }
}
