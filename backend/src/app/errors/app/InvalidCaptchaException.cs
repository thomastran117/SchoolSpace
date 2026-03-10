using backend.app.errors.http;

namespace backend.app.errors.app
{
    public class InvalidCaptchaException : ConflictException
    {
        private const string DefaultMessage = "Invalid captcha.";

        public InvalidCaptchaException()
            : base(DefaultMessage) { }

        public InvalidCaptchaException(string message)
            : base(message) { }

        public InvalidCaptchaException(string message, string details)
            : base(message, details) { }
    }
}
