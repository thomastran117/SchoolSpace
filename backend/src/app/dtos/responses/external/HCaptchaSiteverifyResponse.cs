using System.Text.Json.Serialization;

namespace backend.app.dtos.responses.external
{
    public class HCaptchaSiteverifyResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("challenge_ts")]
        public string? ChallengeTs { get; set; }

        [JsonPropertyName("hostname")]
        public string? Hostname { get; set; }

        [JsonPropertyName("error-codes")]
        public string[]? ErrorCodes { get; set; }

        [JsonPropertyName("credit")]
        public bool? Credit { get; set; }
    }
}
