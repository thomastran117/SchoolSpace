using System.Text.Json;
using backend.app.dtos.responses.external;
using backend.app.errors.http;
using backend.app.http;
using backend.app.services.interfaces;
using Microsoft.AspNetCore.Http;

namespace backend.app.services.implementations
{
    public sealed class HCaptchaService : ICaptchaService
    {
        private const string SiteverifyUrl = "https://api.hcaptcha.com/siteverify";

        private readonly IExternalApiClient _apiClient;
        private readonly ILogger<HCaptchaService> _logger;
        private readonly string _secret;
        private readonly string? _siteKey;
        private readonly IHttpContextAccessor? _httpContextAccessor;
        private static readonly JsonSerializerOptions JsonOpts = new(JsonSerializerDefaults.Web);

        public HCaptchaService(
            IExternalApiClient apiClient,
            ILogger<HCaptchaService> logger,
            IConfiguration config,
            IHttpContextAccessor? httpContextAccessor = null
        )
        {
            _apiClient = apiClient;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;

            var secret = config["HCaptcha:Secret"] ?? config["HCAPTCHA_SECRET"];
            if (string.IsNullOrWhiteSpace(secret))
            {
                throw new NotAvaliableException(
                    "hCaptcha secret is not configured. Set one of: HCaptcha:Secret or HCAPTCHA_SECRET."
                );
            }
            _secret = secret;

            _siteKey = config["HCaptcha:SiteKey"] ?? config["HCAPTCHA_SITEKEY"];
        }

        /// <inheritdoc />
        public async Task<bool> VerifyCaptchaAsync(
            string token,
            CancellationToken cancellationToken = default
        )
        {
            try
            {
                var formData = new Dictionary<string, string>
                {
                    ["secret"] = _secret,
                    ["response"] = token,
                };

                var remoteIp =
                    _httpContextAccessor?.HttpContext?.Connection?.RemoteIpAddress?.ToString();
                if (!string.IsNullOrWhiteSpace(remoteIp))
                    formData["remoteip"] = remoteIp;

                if (!string.IsNullOrWhiteSpace(_siteKey))
                    formData["sitekey"] = _siteKey;

                using var form = new FormUrlEncodedContent(formData);

                using var resp = await _apiClient.PostAsync(SiteverifyUrl, form, cancellationToken);

                if (!resp.IsSuccessStatusCode)
                {
                    var body = await resp.Content.ReadAsStringAsync(cancellationToken);
                    _logger.LogError(
                        "[Captcha] hCaptcha returned HTTP {Status}. Body: {Body}. Allowing login (fail-open).",
                        (int)resp.StatusCode,
                        body
                    );
                    return true;
                }

                await using var stream = await resp.Content.ReadAsStreamAsync(cancellationToken);
                var payload = await JsonSerializer.DeserializeAsync<HCaptchaSiteverifyResponse>(
                    stream,
                    JsonOpts,
                    cancellationToken
                );

                if (payload == null)
                {
                    _logger.LogError(
                        "[Captcha] hCaptcha response deserialized to null. Allowing login (fail-open)."
                    );
                    return true;
                }

                if (payload.Success != true)
                {
                    _logger.LogWarning(
                        "[Captcha] hCaptcha verification failed. ErrorCodes: {ErrorCodes}",
                        payload.ErrorCodes is not null
                            ? string.Join(", ", payload.ErrorCodes)
                            : "none"
                    );
                    return false;
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "[Captcha] hCaptcha verification request failed. Allowing login (fail-open)."
                );
                return true;
            }
        }
    }
}
