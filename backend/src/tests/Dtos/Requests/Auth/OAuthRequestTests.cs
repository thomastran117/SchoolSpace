using backend.app.dtos.request.auth;
using backend.tests.Helpers;
using FluentAssertions;
using Xunit;

namespace backend.tests.Dtos.Requests.Auth;

public class OAuthRequestTests
{
    // -------------------------------------------------------------------------
    // GoogleOAuthRequest
    // -------------------------------------------------------------------------

    [Fact]
    public void GoogleOAuthRequest_WithValidToken_ShouldPassValidation()
    {
        var request = new GoogleOAuthRequest { Token = "valid-google-oauth-token" };
        DtoValidationHelper.IsValid(request).Should().BeTrue();
    }

    [Fact]
    public void GoogleOAuthRequest_WithEmptyToken_ShouldFailValidation()
    {
        var request = new GoogleOAuthRequest { Token = string.Empty };
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    [Fact]
    public void GoogleOAuthRequest_WithWhitespaceToken_ShouldFailValidation()
    {
        var request = new GoogleOAuthRequest { Token = "   " };
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    [Fact]
    public void GoogleOAuthRequest_WithLongToken_ShouldPassValidation()
    {
        var request = new GoogleOAuthRequest { Token = new string('t', 500) };
        DtoValidationHelper.IsValid(request).Should().BeTrue();
    }

    // -------------------------------------------------------------------------
    // MicrosoftOAuthRequest
    // -------------------------------------------------------------------------

    [Fact]
    public void MicrosoftOAuthRequest_WithValidToken_ShouldPassValidation()
    {
        var request = new MicrosoftOAuthRequest { Token = "valid-microsoft-oauth-token" };
        DtoValidationHelper.IsValid(request).Should().BeTrue();
    }

    [Fact]
    public void MicrosoftOAuthRequest_WithEmptyToken_ShouldFailValidation()
    {
        var request = new MicrosoftOAuthRequest { Token = string.Empty };
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    [Fact]
    public void MicrosoftOAuthRequest_WithWhitespaceToken_ShouldFailValidation()
    {
        var request = new MicrosoftOAuthRequest { Token = "   " };
        DtoValidationHelper.IsValid(request).Should().BeFalse();
    }

    [Fact]
    public void MicrosoftOAuthRequest_WithLongToken_ShouldPassValidation()
    {
        var request = new MicrosoftOAuthRequest { Token = new string('t', 500) };
        DtoValidationHelper.IsValid(request).Should().BeTrue();
    }
}
