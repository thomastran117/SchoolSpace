using backend.app.dtos.request.auth;
using backend.tests.Helpers;
using FluentAssertions;
using Xunit;

namespace backend.tests.Dtos.Requests.Auth;

public class ChangePasswordRequestTests
{
    // -------------------------------------------------------------------------
    // Happy path
    // -------------------------------------------------------------------------

    [Fact]
    public void ChangePasswordRequest_WithValidPassword_ShouldPassValidation()
    {
        var request = new ChangePasswordRequest { Password = "Password1!" };
        DtoValidationHelper.IsValid(request).Should().BeTrue();
    }

    [Fact]
    public void ChangePasswordRequest_WithPasswordAtMinimumLength_ShouldPassValidation()
    {
        // Exactly 8 chars meeting all complexity rules
        var request = new ChangePasswordRequest { Password = "Passw0r!" };
        DtoValidationHelper.IsValid(request).Should().BeTrue();
    }

    [Fact]
    public void ChangePasswordRequest_WithPasswordAtMaximumLength_ShouldPassValidation()
    {
        // Exactly 30 chars
        var request = new ChangePasswordRequest { Password = "Password1!Password1!Password1!" };
        DtoValidationHelper.IsValid(request).Should().BeTrue();
    }

    // -------------------------------------------------------------------------
    // Password — Required
    // -------------------------------------------------------------------------

    [Fact]
    public void ChangePasswordRequest_WithEmptyPassword_ShouldFailValidation()
    {
        var request = new ChangePasswordRequest { Password = string.Empty };
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    // -------------------------------------------------------------------------
    // Password — StringLength(30)
    // -------------------------------------------------------------------------

    [Fact]
    public void ChangePasswordRequest_WithPasswordTooLong_ShouldFailValidation()
    {
        // 31 chars — one over the StringLength(30) limit
        var request = new ChangePasswordRequest { Password = "Password1!Password1!Password1!a" };
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    // -------------------------------------------------------------------------
    // Password — StrongPassword complexity rules
    // -------------------------------------------------------------------------

    [Fact]
    public void ChangePasswordRequest_WithPasswordTooShort_ShouldFailValidation()
    {
        var request = new ChangePasswordRequest { Password = "Ab1!" };
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    [Fact]
    public void ChangePasswordRequest_WithNoUppercaseLetter_ShouldFailValidation()
    {
        var request = new ChangePasswordRequest { Password = "password1!" };
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    [Fact]
    public void ChangePasswordRequest_WithNoLowercaseLetter_ShouldFailValidation()
    {
        var request = new ChangePasswordRequest { Password = "PASSWORD1!" };
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    [Fact]
    public void ChangePasswordRequest_WithNoDigit_ShouldFailValidation()
    {
        var request = new ChangePasswordRequest { Password = "Password!!" };
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    [Fact]
    public void ChangePasswordRequest_WithNoSpecialCharacter_ShouldFailValidation()
    {
        var request = new ChangePasswordRequest { Password = "Password11" };
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    // -------------------------------------------------------------------------
    // Error messages
    // -------------------------------------------------------------------------

    [Fact]
    public void ChangePasswordRequest_TooShort_ShouldReportLengthError()
    {
        var request = new ChangePasswordRequest { Password = "Ab1!" };
        DtoValidationHelper.HasErrorContaining(request, "at least").Should().BeTrue();
    }

    [Fact]
    public void ChangePasswordRequest_NoUppercase_ShouldReportUppercaseError()
    {
        var request = new ChangePasswordRequest { Password = "password1!" };
        DtoValidationHelper.HasErrorContaining(request, "uppercase").Should().BeTrue();
    }

    [Fact]
    public void ChangePasswordRequest_NoLowercase_ShouldReportLowercaseError()
    {
        var request = new ChangePasswordRequest { Password = "PASSWORD1!" };
        DtoValidationHelper.HasErrorContaining(request, "lowercase").Should().BeTrue();
    }

    [Fact]
    public void ChangePasswordRequest_NoDigit_ShouldReportNumberError()
    {
        var request = new ChangePasswordRequest { Password = "Password!!" };
        DtoValidationHelper.HasErrorContaining(request, "number").Should().BeTrue();
    }

    [Fact]
    public void ChangePasswordRequest_NoSpecialChar_ShouldReportSpecialCharacterError()
    {
        var request = new ChangePasswordRequest { Password = "Password11" };
        DtoValidationHelper.HasErrorContaining(request, "special character").Should().BeTrue();
    }
}
