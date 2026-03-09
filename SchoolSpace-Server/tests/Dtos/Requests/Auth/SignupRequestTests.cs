using backend.app.dtos.request.auth;
using backend.tests.Helpers;
using FluentAssertions;
using Xunit;

namespace backend.tests.Dtos.Requests.Auth;

public class SignupRequestTests
{
    private const string ValidEmail = "user@example.com";
    private const string ValidPassword = "Password1!";
    private static readonly string ValidCaptcha = new('a', 100);
    private const string ValidRole = "student";

    private static SignupRequest CreateValidRequest() => new()
    {
        Email = ValidEmail,
        Password = ValidPassword,
        Captcha = ValidCaptcha,
        Role = ValidRole
    };

    // -------------------------------------------------------------------------
    // Happy path
    // -------------------------------------------------------------------------

    [Fact]
    public void SignupRequest_WithValidData_ShouldPassValidation()
    {
        var request = CreateValidRequest();
        DtoValidationHelper.IsValid(request).Should().BeTrue();
    }

    // -------------------------------------------------------------------------
    // Role — ValidRole attribute
    // -------------------------------------------------------------------------

    [Theory]
    [InlineData("student")]
    [InlineData("teacher")]
    [InlineData("assistant")]
    public void SignupRequest_WithValidRole_ShouldPassValidation(string role)
    {
        var request = CreateValidRequest();
        request.Role = role;
        DtoValidationHelper.IsValid(request).Should().BeTrue();
    }

    [Theory]
    [InlineData("STUDENT")]
    [InlineData("Teacher")]
    [InlineData("ASSISTANT")]
    public void SignupRequest_WithValidRoleDifferentCase_ShouldPassValidation(string role)
    {
        var request = CreateValidRequest();
        request.Role = role;
        DtoValidationHelper.IsValid(request).Should().BeTrue();
    }

    [Theory]
    [InlineData("admin")]
    [InlineData("principal")]
    [InlineData("user")]
    [InlineData("moderator")]
    [InlineData("unknown")]
    public void SignupRequest_WithUnrecognisedRole_ShouldFailValidation(string role)
    {
        var request = CreateValidRequest();
        request.Role = role;
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    [Fact]
    public void SignupRequest_WithEmptyRole_ShouldFailValidation()
    {
        var request = CreateValidRequest();
        request.Role = string.Empty;
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    // -------------------------------------------------------------------------
    // Inherited fields — Email, Password, Captcha
    // (mirrors AuthRequest rules enforced through SignupRequest)
    // -------------------------------------------------------------------------

    [Theory]
    [InlineData("notanemail")]
    [InlineData("missingdomain@")]
    [InlineData("@nodomain.com")]
    public void SignupRequest_WithInvalidEmail_ShouldFailValidation(string email)
    {
        var request = CreateValidRequest();
        request.Email = email;
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    [Fact]
    public void SignupRequest_WithEmptyEmail_ShouldFailValidation()
    {
        var request = CreateValidRequest();
        request.Email = string.Empty;
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    [Theory]
    [InlineData("password1!", "uppercase")]
    [InlineData("PASSWORD1!", "lowercase")]
    [InlineData("Password!!", "number")]
    [InlineData("Password11", "special character")]
    public void SignupRequest_WithWeakPassword_ShouldFailValidation(string password, string missingRule)
    {
        var request = CreateValidRequest();
        request.Password = password;
        DtoValidationHelper.IsValid(request).Should().BeFalse(
            because: $"password is missing a {missingRule}");
    }

    [Fact]
    public void SignupRequest_WithPasswordTooShort_ShouldFailValidation()
    {
        var request = CreateValidRequest();
        request.Password = "Ab1!";
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    [Fact]
    public void SignupRequest_WithPasswordTooLong_ShouldFailValidation()
    {
        var request = CreateValidRequest();
        request.Password = "Password1!Password1!Password1!a"; // 31 chars
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    [Fact]
    public void SignupRequest_WithShortCaptcha_ShouldFailValidation()
    {
        var request = CreateValidRequest();
        request.Captcha = new string('x', 99);
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    [Fact]
    public void SignupRequest_WithEmptyCaptcha_ShouldFailValidation()
    {
        var request = CreateValidRequest();
        request.Captcha = string.Empty;
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    [Fact]
    public void SignupRequest_WithWhitespaceCaptcha_ShouldFailValidation()
    {
        var request = CreateValidRequest();
        request.Captcha = new string(' ', 100);
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }
}
