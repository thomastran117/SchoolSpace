using backend.app.errors.http;

namespace backend.app.errors.app
{
    public class AccountLockedException : ForbiddenException
    {
        private const string DefaultMessage =
            "Account temporarily locked due to too many failed login attempts.";

        public AccountLockedException()
            : base(DefaultMessage) { }

        public AccountLockedException(string message)
            : base(message) { }

        public AccountLockedException(string message, string details)
            : base(message, details) { }
    }
}
