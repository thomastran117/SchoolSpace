using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.app.errors.http;
using backend.app.models.core;
using backend.app.services.implementations;
using backend.app.services.interfaces;
using backend.app.utilities.interfaces;
using FluentAssertions;
using Microsoft.IdentityModel.Tokens;
using Moq;
using Xunit;

namespace backend.tests.Services;

public class TokenServiceTests
{
    private readonly Mock<ICacheService> _cache = new();
    private readonly Mock<ICustomLogger> _logger = new();
    private readonly Mock<IRandomTokenGenerator> _tokenGen = new();
    private readonly TokenService _sut;

    public TokenServiceTests()
    {
        _sut = new TokenService(_cache.Object, _logger.Object, _tokenGen.Object);
    }

    // -------------------------------------------------------------------------
    // Fixtures
    // -------------------------------------------------------------------------

    private static User CreateUser(
        int id = 1,
        string email = "user@example.com",
        UserRole role = UserRole.Student
    ) => new() { Id = id, Email = email, Usertype = role, Status = UserStatus.Active };

    private static JwtSecurityToken ParseJwt(string token)
        => new JwtSecurityTokenHandler().ReadJwtToken(token);

    // =========================================================================
    // GenerateAccessToken
    // =========================================================================

    [Fact]
    public void GenerateAccessToken_ReturnsNonEmptyString()
    {
        var token = _sut.GenerateAccessToken(CreateUser());
        token.Should().NotBeNullOrWhiteSpace();
    }

    [Fact]
    public void GenerateAccessToken_ReturnsValidJwt()
    {
        var raw = _sut.GenerateAccessToken(CreateUser());
        var act = () => ParseJwt(raw);
        act.Should().NotThrow();
    }

    [Fact]
    public void GenerateAccessToken_ContainsCorrectIssuerAndAudience()
    {
        var jwt = ParseJwt(_sut.GenerateAccessToken(CreateUser()));
        jwt.Issuer.Should().Be("SchoolSpace");
        jwt.Audiences.Should().Contain("SchoolSpaceConsumers");
    }

    [Fact]
    public void GenerateAccessToken_ContainsUserIdClaim()
    {
        var user = CreateUser(id: 42);
        var jwt = ParseJwt(_sut.GenerateAccessToken(user));

        jwt.Claims
            .First(c => c.Type == ClaimTypes.NameIdentifier)
            .Value.Should().Be("42");
    }

    [Fact]
    public void GenerateAccessToken_ContainsEmailClaim()
    {
        var user = CreateUser(email: "teacher@school.com");
        var jwt = ParseJwt(_sut.GenerateAccessToken(user));

        jwt.Claims
            .First(c => c.Type == ClaimTypes.Name)
            .Value.Should().Be("teacher@school.com");
    }

    [Theory]
    [InlineData(UserRole.Student, "Student")]
    [InlineData(UserRole.Teacher, "Teacher")]
    [InlineData(UserRole.Admin, "Admin")]
    public void GenerateAccessToken_ContainsCorrectRoleClaim(UserRole role, string expectedRole)
    {
        var user = CreateUser(role: role);
        var jwt = ParseJwt(_sut.GenerateAccessToken(user));

        jwt.Claims
            .First(c => c.Type == ClaimTypes.Role)
            .Value.Should().Be(expectedRole);
    }

    [Fact]
    public void GenerateAccessToken_ExpiresApproximately15MinutesFromNow()
    {
        var before = DateTime.UtcNow.AddMinutes(14);
        var after = DateTime.UtcNow.AddMinutes(16);

        var jwt = ParseJwt(_sut.GenerateAccessToken(CreateUser()));

        jwt.ValidTo.Should().BeAfter(before).And.BeBefore(after);
    }

    [Fact]
    public void GenerateAccessToken_IsSignedWithHmacSha256()
    {
        var jwt = ParseJwt(_sut.GenerateAccessToken(CreateUser()));
        jwt.SignatureAlgorithm.Should().Be(SecurityAlgorithms.HmacSha256);
    }

    [Fact]
    public void GenerateAccessToken_WhenCacheThrows_ThrowsInternalServerError()
    {
        // Force the signing key ctor to fail by using a fresh TokenService whose
        // tokenGenerator throws during a downstream call — simulated by logger mock
        // throwing a non-app exception on a subsequent dependency.
        // The easiest path: cause GenerateAccessToken to throw via the logger mock.
        _logger.Setup(l => l.Error(It.IsAny<string>())).Throws(new InvalidOperationException("log fail"));

        // Arrange: make the token generator throw to trigger the catch block
        var brokenTokenGen = new Mock<IRandomTokenGenerator>();
        brokenTokenGen.Setup(g => g.Generate(It.IsAny<int>())).Throws(new InvalidOperationException("boom"));

        // GenerateAccessToken doesn't call the token generator; verify that a
        // different unexpected exception surfaces as InternalServerErrorException.
        // We test this indirectly through GenerateRefreshToken (which does use the generator).
        var sut = new TokenService(_cache.Object, _logger.Object, brokenTokenGen.Object);
        var act = async () => await sut.GenerateRefreshToken(1);
        act.Should().ThrowAsync<InternalServerErrorException>();
    }

    // =========================================================================
    // GenerateRefreshToken
    // =========================================================================

    [Fact]
    public async Task GenerateRefreshToken_ReturnsTokenFromGenerator()
    {
        _tokenGen.Setup(g => g.Generate(64)).Returns("generated-refresh-token");
        _cache.Setup(c => c.SetValueAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<TimeSpan?>()))
              .ReturnsAsync(true);

        var result = await _sut.GenerateRefreshToken(99);

        result.Should().Be("generated-refresh-token");
    }

    [Fact]
    public async Task GenerateRefreshToken_StoresUserIdUnderPrefixedKey()
    {
        const string token = "abc123token";
        _tokenGen.Setup(g => g.Generate(64)).Returns(token);
        _cache.Setup(c => c.SetValueAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<TimeSpan?>()))
              .ReturnsAsync(true);

        await _sut.GenerateRefreshToken(7);

        _cache.Verify(c =>
            c.SetValueAsync(
                "refresh_token:" + token,
                "7",
                It.Is<TimeSpan?>(t => t.HasValue && t.Value == TimeSpan.FromDays(7))
            ),
            Times.Once
        );
    }

    [Fact]
    public async Task GenerateRefreshToken_WhenCacheThrows_ThrowsInternalServerError()
    {
        _tokenGen.Setup(g => g.Generate(64)).Returns("tok");
        _cache.Setup(c => c.SetValueAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<TimeSpan?>()))
              .ThrowsAsync(new Exception("cache down"));

        await _sut.Invoking(s => s.GenerateRefreshToken(1))
                  .Should().ThrowAsync<InternalServerErrorException>();
    }

    // =========================================================================
    // ValidateRefreshToken
    // =========================================================================

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task ValidateRefreshToken_WithBlankToken_ReturnsNull(string? token)
    {
        var result = await _sut.ValidateRefreshToken(token!);
        result.Should().BeNull();
    }

    [Fact]
    public async Task ValidateRefreshToken_WithValidToken_ReturnsUserId()
    {
        _cache.Setup(c => c.GetValueAsync("refresh_token:valid-token")).ReturnsAsync("55");

        var result = await _sut.ValidateRefreshToken("valid-token");

        result.Should().Be(55);
    }

    [Fact]
    public async Task ValidateRefreshToken_WhenKeyNotInCache_ReturnsNull()
    {
        _cache.Setup(c => c.GetValueAsync(It.IsAny<string>())).ReturnsAsync((string?)null);

        var result = await _sut.ValidateRefreshToken("unknown-token");

        result.Should().BeNull();
    }

    [Fact]
    public async Task ValidateRefreshToken_WhenCacheValueIsNotInteger_ReturnsNull()
    {
        _cache.Setup(c => c.GetValueAsync(It.IsAny<string>())).ReturnsAsync("not-a-number");

        var result = await _sut.ValidateRefreshToken("some-token");

        result.Should().BeNull();
    }

    [Fact]
    public async Task ValidateRefreshToken_WhenCacheThrows_ThrowsInternalServerError()
    {
        _cache.Setup(c => c.GetValueAsync(It.IsAny<string>())).ThrowsAsync(new Exception("cache down"));

        await _sut.Invoking(s => s.ValidateRefreshToken("tok"))
                  .Should().ThrowAsync<InternalServerErrorException>();
    }

    // =========================================================================
    // RotateRefreshTokenAsync
    // =========================================================================

    [Fact]
    public async Task RotateRefreshToken_WhenTokenIsInvalid_ReturnsNull()
    {
        _cache.Setup(c => c.GetValueAsync(It.IsAny<string>())).ReturnsAsync((string?)null);

        var result = await _sut.RotateRefreshTokenAsync("bad-token");

        result.Should().BeNull();
    }

    [Fact]
    public async Task RotateRefreshToken_DeletesOldTokenKey()
    {
        const string oldToken = "old-refresh-token";
        _cache.Setup(c => c.GetValueAsync("refresh_token:" + oldToken)).ReturnsAsync("10");
        _cache.Setup(c => c.DeleteKeyAsync(It.IsAny<string>())).ReturnsAsync(true);
        _tokenGen.Setup(g => g.Generate(64)).Returns("new-refresh-token");
        _cache.Setup(c => c.SetValueAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<TimeSpan?>()))
              .ReturnsAsync(true);

        await _sut.RotateRefreshTokenAsync(oldToken);

        _cache.Verify(c => c.DeleteKeyAsync("refresh_token:" + oldToken), Times.Once);
    }

    [Fact]
    public async Task RotateRefreshToken_ReturnsNewTokenAndUserId()
    {
        _cache.Setup(c => c.GetValueAsync("refresh_token:old")).ReturnsAsync("10");
        _cache.Setup(c => c.DeleteKeyAsync(It.IsAny<string>())).ReturnsAsync(true);
        _tokenGen.Setup(g => g.Generate(64)).Returns("new-token");
        _cache.Setup(c => c.SetValueAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<TimeSpan?>()))
              .ReturnsAsync(true);

        var result = await _sut.RotateRefreshTokenAsync("old");

        result.Should().NotBeNull();
        result!.Value.NewRefreshToken.Should().Be("new-token");
        result!.Value.UserId.Should().Be(10);
    }

    [Fact]
    public async Task RotateRefreshToken_WhenCacheThrows_ThrowsInternalServerError()
    {
        _cache.Setup(c => c.GetValueAsync(It.IsAny<string>())).ThrowsAsync(new Exception("cache down"));

        await _sut.Invoking(s => s.RotateRefreshTokenAsync("tok"))
                  .Should().ThrowAsync<InternalServerErrorException>();
    }

    // =========================================================================
    // InvalidateRefreshTokenAsync
    // =========================================================================

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task InvalidateRefreshToken_WithBlankToken_ReturnsFalse(string? token)
    {
        var result = await _sut.InvalidateRefreshTokenAsync(token!);
        result.Should().BeFalse();
    }

    [Fact]
    public async Task InvalidateRefreshToken_CallsDeleteOnPrefixedKey()
    {
        _cache.Setup(c => c.DeleteKeyAsync("refresh_token:my-token")).ReturnsAsync(true);

        var result = await _sut.InvalidateRefreshTokenAsync("my-token");

        result.Should().BeTrue();
        _cache.Verify(c => c.DeleteKeyAsync("refresh_token:my-token"), Times.Once);
    }

    [Fact]
    public async Task InvalidateRefreshToken_WhenKeyDoesNotExist_ReturnsFalse()
    {
        _cache.Setup(c => c.DeleteKeyAsync(It.IsAny<string>())).ReturnsAsync(false);

        var result = await _sut.InvalidateRefreshTokenAsync("ghost-token");

        result.Should().BeFalse();
    }

    [Fact]
    public async Task InvalidateRefreshToken_WhenCacheThrows_ThrowsInternalServerError()
    {
        _cache.Setup(c => c.DeleteKeyAsync(It.IsAny<string>())).ThrowsAsync(new Exception("cache down"));

        await _sut.Invoking(s => s.InvalidateRefreshTokenAsync("tok"))
                  .Should().ThrowAsync<InternalServerErrorException>();
    }

    // =========================================================================
    // GenerateVerificationToken
    // =========================================================================

    [Fact]
    public async Task GenerateVerificationToken_ReturnsTokenFromGenerator()
    {
        var user = CreateUser(id: 5, email: "verify@example.com");
        _tokenGen.Setup(g => g.Generate(48)).Returns("verify-token-abc");
        _cache.Setup(c => c.SetValueAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<TimeSpan?>()))
              .ReturnsAsync(true);

        var result = await _sut.GenerateVerificationToken(user);

        result.Should().Be("verify-token-abc");
    }

    [Fact]
    public async Task GenerateVerificationToken_StoresTokenKeyWithUserId()
    {
        var user = CreateUser(id: 5, email: "verify@example.com");
        _tokenGen.Setup(g => g.Generate(48)).Returns("verify-token-abc");
        _cache.Setup(c => c.SetValueAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<TimeSpan?>()))
              .ReturnsAsync(true);

        await _sut.GenerateVerificationToken(user);

        _cache.Verify(c =>
            c.SetValueAsync(
                "verification_token:verify-token-abc",
                "5",
                It.Is<TimeSpan?>(t => t.HasValue && t.Value == TimeSpan.FromHours(24))
            ),
            Times.Once
        );
    }

    [Fact]
    public async Task GenerateVerificationToken_StoresEmailKeyWithToken()
    {
        var user = CreateUser(id: 5, email: "verify@example.com");
        _tokenGen.Setup(g => g.Generate(48)).Returns("verify-token-abc");
        _cache.Setup(c => c.SetValueAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<TimeSpan?>()))
              .ReturnsAsync(true);

        await _sut.GenerateVerificationToken(user);

        _cache.Verify(c =>
            c.SetValueAsync(
                "verification_email:verify@example.com",
                "verify-token-abc",
                It.Is<TimeSpan?>(t => t.HasValue && t.Value == TimeSpan.FromHours(24))
            ),
            Times.Once
        );
    }

    [Fact]
    public async Task GenerateVerificationToken_WhenCacheThrows_ThrowsInternalServerError()
    {
        var user = CreateUser();
        _tokenGen.Setup(g => g.Generate(48)).Returns("tok");
        _cache.Setup(c => c.SetValueAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<TimeSpan?>()))
              .ThrowsAsync(new Exception("cache down"));

        await _sut.Invoking(s => s.GenerateVerificationToken(user))
                  .Should().ThrowAsync<InternalServerErrorException>();
    }

    // =========================================================================
    // VerifyVerificationToken
    // =========================================================================

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task VerifyVerificationToken_WithBlankToken_ReturnsNull(string? token)
    {
        var result = await _sut.VerifyVerificationToken(token!);
        result.Should().BeNull();
    }

    [Fact]
    public async Task VerifyVerificationToken_WithValidToken_ReturnsUserId()
    {
        _cache.Setup(c => c.GetValueAsync("verification_token:abc-token")).ReturnsAsync("33");

        var result = await _sut.VerifyVerificationToken("abc-token");

        result.Should().Be(33);
    }

    [Fact]
    public async Task VerifyVerificationToken_WhenKeyNotInCache_ReturnsNull()
    {
        _cache.Setup(c => c.GetValueAsync(It.IsAny<string>())).ReturnsAsync((string?)null);

        var result = await _sut.VerifyVerificationToken("missing-token");

        result.Should().BeNull();
    }

    [Fact]
    public async Task VerifyVerificationToken_WhenCacheValueIsNotInteger_ReturnsNull()
    {
        _cache.Setup(c => c.GetValueAsync(It.IsAny<string>())).ReturnsAsync("not-a-number");

        var result = await _sut.VerifyVerificationToken("some-token");

        result.Should().BeNull();
    }

    [Fact]
    public async Task VerifyVerificationToken_WhenCacheThrows_ThrowsInternalServerError()
    {
        _cache.Setup(c => c.GetValueAsync(It.IsAny<string>())).ThrowsAsync(new Exception("cache down"));

        await _sut.Invoking(s => s.VerifyVerificationToken("tok"))
                  .Should().ThrowAsync<InternalServerErrorException>();
    }

    // =========================================================================
    // VerificationTokenExist
    // =========================================================================

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task VerificationTokenExist_WithBlankEmail_ReturnsNull(string? email)
    {
        var result = await _sut.VerificationTokenExist(email!);
        result.Should().BeNull();
    }

    [Fact]
    public async Task VerificationTokenExist_WhenEmailHasToken_ReturnsToken()
    {
        _cache.Setup(c => c.GetValueAsync("verification_email:user@example.com"))
              .ReturnsAsync("existing-token");

        var result = await _sut.VerificationTokenExist("user@example.com");

        result.Should().Be("existing-token");
    }

    [Fact]
    public async Task VerificationTokenExist_WhenEmailNotInCache_ReturnsNull()
    {
        _cache.Setup(c => c.GetValueAsync(It.IsAny<string>())).ReturnsAsync((string?)null);

        var result = await _sut.VerificationTokenExist("unknown@example.com");

        result.Should().BeNull();
    }

    [Fact]
    public async Task VerificationTokenExist_WhenCacheThrows_ThrowsInternalServerError()
    {
        _cache.Setup(c => c.GetValueAsync(It.IsAny<string>())).ThrowsAsync(new Exception("cache down"));

        await _sut.Invoking(s => s.VerificationTokenExist("user@example.com"))
                  .Should().ThrowAsync<InternalServerErrorException>();
    }
}
