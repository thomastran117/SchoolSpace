using System.Net;
using System.Text;
using System.Text.Json;
using backend.app.errors.http;
using backend.app.http;
using backend.app.services.implementations;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace backend.tests.Services;

public class CloudflareTurnstileCaptchaServiceTests
{
    private readonly Mock<IExternalApiClient> _apiClient = new();
    private readonly Mock<ILogger<CloudflareTurnstileCaptchaService>> _logger = new();
    private readonly Mock<IHttpContextAccessor> _httpContextAccessor = new();

    private CloudflareTurnstileCaptchaService CreateSut(
        string? secret = "test-secret",
        string? configKey = "Turnstile:Secret",
        IHttpContextAccessor? httpContextAccessor = null
    )
    {
        var entries = secret is not null && configKey is not null
            ? new Dictionary<string, string?> { [configKey] = secret }
            : new Dictionary<string, string?>();

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(entries)
            .Build();

        return new CloudflareTurnstileCaptchaService(
            _apiClient.Object,
            _logger.Object,
            config,
            httpContextAccessor
        );
    }

    private static HttpResponseMessage OkJsonResponse(object payload) =>
        new(HttpStatusCode.OK)
        {
            Content = new StringContent(
                JsonSerializer.Serialize(payload),
                Encoding.UTF8,
                "application/json"
            )
        };

    // =========================================================================
    // Constructor
    // =========================================================================

    [Fact]
    public void Constructor_WhenNoSecretIsConfigured_ThrowsNotAvaliableException()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>())
            .Build();

        var act = () => new CloudflareTurnstileCaptchaService(
            _apiClient.Object,
            _logger.Object,
            config
        );

        act.Should().Throw<NotAvaliableException>();
    }

    [Theory]
    [InlineData("Turnstile:Secret")]
    [InlineData("CLOUDFLARE_TURNSTILE_SECRET")]
    [InlineData("TURNSTILE_SECRET")]
    public void Constructor_WhenAnyRecognisedSecretKeyIsSet_DoesNotThrow(string configKey)
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { [configKey] = "my-secret" })
            .Build();

        var act = () => new CloudflareTurnstileCaptchaService(
            _apiClient.Object,
            _logger.Object,
            config
        );

        act.Should().NotThrow();
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Constructor_WhenSecretIsBlankOrWhitespace_ThrowsNotAvaliableException(string blankSecret)
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["Turnstile:Secret"] = blankSecret })
            .Build();

        var act = () => new CloudflareTurnstileCaptchaService(
            _apiClient.Object,
            _logger.Object,
            config
        );

        act.Should().Throw<NotAvaliableException>();
    }

    // =========================================================================
    // VerifyCaptchaAsync — happy path
    // =========================================================================

    [Fact]
    public async Task VerifyCaptchaAsync_WhenTurnstileReturnsSuccess_ReturnsTrue()
    {
        _apiClient
            .Setup(c => c.PostAsync(It.IsAny<string>(), It.IsAny<HttpContent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(OkJsonResponse(new { success = true }));

        var result = await CreateSut().VerifyCaptchaAsync("valid-token");

        result.Should().BeTrue();
    }

    [Fact]
    public async Task VerifyCaptchaAsync_WhenTurnstileReturnsFailure_ReturnsFalse()
    {
        _apiClient
            .Setup(c => c.PostAsync(It.IsAny<string>(), It.IsAny<HttpContent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(OkJsonResponse(new { success = false }));

        var result = await CreateSut().VerifyCaptchaAsync("invalid-token");

        result.Should().BeFalse();
    }

    [Fact]
    public async Task VerifyCaptchaAsync_WhenTurnstileReturnsFailureWithErrorCodes_ReturnsFalse()
    {
        _apiClient
            .Setup(c => c.PostAsync(It.IsAny<string>(), It.IsAny<HttpContent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(OkJsonResponse(new
            {
                success = false,
                // matches the [JsonPropertyName("error-codes")] property
                error_codes = new[] { "invalid-input-response", "timeout-or-duplicate" }
            }));

        var result = await CreateSut().VerifyCaptchaAsync("expired-token");

        result.Should().BeFalse();
    }

    // =========================================================================
    // VerifyCaptchaAsync — fail-open behaviour
    // =========================================================================

    [Fact]
    public async Task VerifyCaptchaAsync_WhenHttpResponseIsNotSuccess_ReturnsTrue()
    {
        _apiClient
            .Setup(c => c.PostAsync(It.IsAny<string>(), It.IsAny<HttpContent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.InternalServerError)
            {
                Content = new StringContent("upstream error", Encoding.UTF8, "text/plain")
            });

        var result = await CreateSut().VerifyCaptchaAsync("some-token");

        result.Should().BeTrue();
    }

    [Fact]
    public async Task VerifyCaptchaAsync_WhenApiClientThrows_ReturnsTrue()
    {
        _apiClient
            .Setup(c => c.PostAsync(It.IsAny<string>(), It.IsAny<HttpContent>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new HttpRequestException("connection refused"));

        var result = await CreateSut().VerifyCaptchaAsync("some-token");

        result.Should().BeTrue();
    }

    [Fact]
    public async Task VerifyCaptchaAsync_WhenResponseDeserializesToNull_ReturnsTrue()
    {
        _apiClient
            .Setup(c => c.PostAsync(It.IsAny<string>(), It.IsAny<HttpContent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent("null", Encoding.UTF8, "application/json")
            });

        var result = await CreateSut().VerifyCaptchaAsync("some-token");

        result.Should().BeTrue();
    }

    [Theory]
    [InlineData(HttpStatusCode.BadGateway)]
    [InlineData(HttpStatusCode.ServiceUnavailable)]
    [InlineData(HttpStatusCode.GatewayTimeout)]
    public async Task VerifyCaptchaAsync_WhenTurnstileIsDownWithVariousStatusCodes_ReturnsTrue(HttpStatusCode statusCode)
    {
        _apiClient
            .Setup(c => c.PostAsync(It.IsAny<string>(), It.IsAny<HttpContent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new HttpResponseMessage(statusCode)
            {
                Content = new StringContent(string.Empty, Encoding.UTF8, "text/plain")
            });

        var result = await CreateSut().VerifyCaptchaAsync("some-token");

        result.Should().BeTrue();
    }

    // =========================================================================
    // VerifyCaptchaAsync — request shape
    // =========================================================================

    [Fact]
    public async Task VerifyCaptchaAsync_PostsToTurnstileSiteverifyUrl()
    {
        _apiClient
            .Setup(c => c.PostAsync(It.IsAny<string>(), It.IsAny<HttpContent>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(OkJsonResponse(new { success = true }));

        await CreateSut().VerifyCaptchaAsync("my-token");

        _apiClient.Verify(c => c.PostAsync(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            It.IsAny<HttpContent>(),
            It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task VerifyCaptchaAsync_AlwaysIncludesSecretAndTokenInFormBody()
    {
        string? capturedBody = null;
        _apiClient
            .Setup(c => c.PostAsync(It.IsAny<string>(), It.IsAny<HttpContent>(), It.IsAny<CancellationToken>()))
            .Callback<string, HttpContent, CancellationToken>(
                (_, content, _) => capturedBody = content.ReadAsStringAsync().GetAwaiter().GetResult())
            .ReturnsAsync(OkJsonResponse(new { success = true }));

        await CreateSut(secret: "my-configured-secret").VerifyCaptchaAsync("the-captcha-token");

        capturedBody.Should().Contain("secret=my-configured-secret");
        capturedBody.Should().Contain("response=the-captcha-token");
    }

    [Fact]
    public async Task VerifyCaptchaAsync_WhenRemoteIpIsAvailable_IncludesRemoteIpInFormBody()
    {
        var connection = new Mock<ConnectionInfo>();
        connection.Setup(c => c.RemoteIpAddress).Returns(IPAddress.Parse("1.2.3.4"));

        var httpContext = new Mock<HttpContext>();
        httpContext.Setup(c => c.Connection).Returns(connection.Object);
        _httpContextAccessor.Setup(a => a.HttpContext).Returns(httpContext.Object);

        string? capturedBody = null;
        _apiClient
            .Setup(c => c.PostAsync(It.IsAny<string>(), It.IsAny<HttpContent>(), It.IsAny<CancellationToken>()))
            .Callback<string, HttpContent, CancellationToken>(
                (_, content, _) => capturedBody = content.ReadAsStringAsync().GetAwaiter().GetResult())
            .ReturnsAsync(OkJsonResponse(new { success = true }));

        await CreateSut(httpContextAccessor: _httpContextAccessor.Object).VerifyCaptchaAsync("my-token");

        capturedBody.Should().Contain("remoteip=1.2.3.4");
    }

    [Fact]
    public async Task VerifyCaptchaAsync_WhenNoHttpContext_OmitsRemoteIpFromFormBody()
    {
        _httpContextAccessor.Setup(a => a.HttpContext).Returns((HttpContext?)null);

        string? capturedBody = null;
        _apiClient
            .Setup(c => c.PostAsync(It.IsAny<string>(), It.IsAny<HttpContent>(), It.IsAny<CancellationToken>()))
            .Callback<string, HttpContent, CancellationToken>(
                (_, content, _) => capturedBody = content.ReadAsStringAsync().GetAwaiter().GetResult())
            .ReturnsAsync(OkJsonResponse(new { success = true }));

        await CreateSut(httpContextAccessor: _httpContextAccessor.Object).VerifyCaptchaAsync("my-token");

        capturedBody.Should().NotContain("remoteip");
    }

    [Fact]
    public async Task VerifyCaptchaAsync_WhenHttpContextAccessorIsNull_OmitsRemoteIpFromFormBody()
    {
        string? capturedBody = null;
        _apiClient
            .Setup(c => c.PostAsync(It.IsAny<string>(), It.IsAny<HttpContent>(), It.IsAny<CancellationToken>()))
            .Callback<string, HttpContent, CancellationToken>(
                (_, content, _) => capturedBody = content.ReadAsStringAsync().GetAwaiter().GetResult())
            .ReturnsAsync(OkJsonResponse(new { success = true }));

        await CreateSut(httpContextAccessor: null).VerifyCaptchaAsync("my-token");

        capturedBody.Should().NotContain("remoteip");
    }

    // =========================================================================
    // VerifyCaptchaAsync — cancellation
    // =========================================================================

    [Fact]
    public async Task VerifyCaptchaAsync_PassesCancellationTokenToApiClient()
    {
        using var cts = new CancellationTokenSource();
        var token = cts.Token;

        _apiClient
            .Setup(c => c.PostAsync(It.IsAny<string>(), It.IsAny<HttpContent>(), token))
            .ReturnsAsync(OkJsonResponse(new { success = true }));

        await CreateSut().VerifyCaptchaAsync("my-token", token);

        _apiClient.Verify(c => c.PostAsync(
            It.IsAny<string>(),
            It.IsAny<HttpContent>(),
            token),
            Times.Once);
    }
}
