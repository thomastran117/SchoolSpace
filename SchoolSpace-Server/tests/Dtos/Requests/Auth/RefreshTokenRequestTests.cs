using backend.app.dtos.request.auth;
using backend.tests.Helpers;
using FluentAssertions;
using Xunit;

namespace backend.tests.Dtos.Requests.Auth;

public class RefreshTokenRequestTests
{
    // RefreshToken is an optional nullable string — no validation attributes are applied.

    [Fact]
    public void RefreshTokenRequest_WithValidToken_ShouldPassValidation()
    {
        var request = new RefreshTokenRequest { RefreshToken = "some-valid-refresh-token" };
        DtoValidationHelper.IsValid(request).Should().BeTrue();
    }

    [Fact]
    public void RefreshTokenRequest_WithNullToken_ShouldPassValidation()
    {
        var request = new RefreshTokenRequest { RefreshToken = null };
        DtoValidationHelper.IsValid(request).Should().BeTrue();
    }

    [Fact]
    public void RefreshTokenRequest_WithEmptyToken_ShouldPassValidation()
    {
        var request = new RefreshTokenRequest { RefreshToken = string.Empty };
        DtoValidationHelper.IsValid(request).Should().BeTrue();
    }

    [Fact]
    public void RefreshTokenRequest_TokenIsNullByDefault()
    {
        var request = new RefreshTokenRequest();
        request.RefreshToken.Should().BeNull();
    }
}
