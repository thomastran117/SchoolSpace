using backend.app.dtos.request.auth;
using backend.tests.Helpers;
using FluentAssertions;
using Xunit;

namespace backend.tests.Dtos.Requests.Auth;

public class LoginRequestTests
{
    private const string ValidEmail = "user@example.com";
    private const string ValidPassword = "Password1!";
    private static readonly string ValidCaptcha = new('a', 100);

    private static LoginRequest CreateValidRequest() => new()
    {
        Email = ValidEmail,
        Password = ValidPassword,
        Captcha = ValidCaptcha
    };

    // -------------------------------------------------------------------------
    // Happy path
    // -------------------------------------------------------------------------

    [Fact]
    public void LoginRequest_WithValidData_ShouldPassValidation()
    {
        var request = CreateValidRequest();
        DtoValidationHelper.IsValid(request).Should().BeTrue();
    }

    [Fact]
    public void LoginRequest_WithRememberMeTrue_ShouldPassValidation()
    {
        var request = CreateValidRequest();
        request.RememberMe = true;
        DtoValidationHelper.IsValid(request).Should().BeTrue();
    }

    [Fact]
    public void LoginRequest_RememberMe_DefaultsToFalse()
    {
        var request = CreateValidRequest();
        request.RememberMe.Should().BeFalse();
    }

    // -------------------------------------------------------------------------
    // Email validation
    // -------------------------------------------------------------------------

    [Theory]
    [InlineData("notanemail")]
    [InlineData("missing@")]
    [InlineData("@nodomain.com")]
    [InlineData("plaintext")]
    [InlineData("missingdomain@")]
    public void LoginRequest_WithInvalidEmailFormat_ShouldFailValidation(string email)
    {
        var request = CreateValidRequest();
        request.Email = email;
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    [Fact]
    public void LoginRequest_WithEmptyEmail_ShouldFailValidation()
    {
        var request = CreateValidRequest();
        request.Email = string.Empty;
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    // -------------------------------------------------------------------------
    // Password — StrongPassword rules
    // -------------------------------------------------------------------------

    [Fact]
    public void LoginRequest_WithPasswordTooShort_ShouldFailValidation()
    {
        var request = CreateValidRequest();
        request.Password = "Ab1!";
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    [Fact]
    public void LoginRequest_WithPasswordTooLong_ShouldFailValidation()
    {
        // 31 chars — exceeds StringLength(30)
        var request = CreateValidRequest();
        request.Password = "Password1!Password1!Password1!a";
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    [Fact]
    public void LoginRequest_WithPasswordAtMaxLength_ShouldPassValidation()
    {
        // Exactly 30 chars, still meeting all complexity rules
        var request = CreateValidRequest();
        request.Password = "Password1!Password1!Password1!";
        DtoValidationHelper.IsValid(request).Should().BeTrue();
    }

    [Theory]
    [InlineData("password1!", "uppercase")]
    [InlineData("PASSWORD1!", "lowercase")]
    [InlineData("Password!!", "number")]
    [InlineData("Password11", "special")]
    public void LoginRequest_WithPasswordMissingComplexityRule_ShouldFailValidation(
        string password, string missingRule)
    {
        var request = CreateValidRequest();
        request.Password = password;
        DtoValidationHelper.IsValid(request).Should().BeFalse(
            because: $"password is missing a {missingRule} character");
    }

    [Fact]
    public void LoginRequest_WithEmptyPassword_ShouldFailValidation()
    {
        var request = CreateValidRequest();
        request.Password = string.Empty;
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    // -------------------------------------------------------------------------
    // Captcha — ValidCaptchaToken rules
    // -------------------------------------------------------------------------

    [Fact]
    public void LoginRequest_WithCaptchaExactlyMinimumLength_ShouldPassValidation()
    {
        var request = CreateValidRequest();
        request.Captcha = new string('x', 100);
        DtoValidationHelper.IsValid(request).Should().BeTrue();
    }

    [Fact]
    public void LoginRequest_WithCaptchaShorterThanMinimum_ShouldFailValidation()
    {
        var request = CreateValidRequest();
        request.Captcha = new string('x', 99);
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    [Fact]
    public void LoginRequest_WithEmptyCaptcha_ShouldFailValidation()
    {
        var request = CreateValidRequest();
        request.Captcha = string.Empty;
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    [Fact]
    public void LoginRequest_WithWhitespaceCaptcha_ShouldFailValidation()
    {
        var request = CreateValidRequest();
        request.Captcha = new string(' ', 100);
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }
}
