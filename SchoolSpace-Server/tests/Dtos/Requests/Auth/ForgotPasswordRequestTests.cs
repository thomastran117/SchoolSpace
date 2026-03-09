using backend.app.dtos.request.auth;
using backend.tests.Helpers;
using FluentAssertions;
using Xunit;

namespace backend.tests.Dtos.Requests.Auth;

public class ForgotPasswordRequestTests
{
    // -------------------------------------------------------------------------
    // Happy path
    // -------------------------------------------------------------------------

    [Theory]
    [InlineData("user@example.com")]
    [InlineData("User.Name+tag@sub.domain.org")]
    [InlineData("simple@test.io")]
    public void ForgotPasswordRequest_WithValidEmail_ShouldPassValidation(string email)
    {
        var request = new ForgotPasswordRequest { Email = email };
        DtoValidationHelper.IsValid(request).Should().BeTrue();
    }

    // -------------------------------------------------------------------------
    // Email — Required + EmailAddress
    // -------------------------------------------------------------------------

    [Theory]
    [InlineData("notanemail")]
    [InlineData("missingdomain@")]
    [InlineData("@nodomain.com")]
    [InlineData("plaintext")]
    [InlineData("missing.at.sign")]
    public void ForgotPasswordRequest_WithInvalidEmailFormat_ShouldFailValidation(string email)
    {
        var request = new ForgotPasswordRequest { Email = email };
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    [Fact]
    public void ForgotPasswordRequest_WithEmptyEmail_ShouldFailValidation()
    {
        var request = new ForgotPasswordRequest { Email = string.Empty };
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }
}
