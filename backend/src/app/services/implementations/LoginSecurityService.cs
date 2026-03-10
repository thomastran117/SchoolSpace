using System.Security.Cryptography;
using backend.app.errors.app;
using backend.app.services.interfaces;
using backend.app.utilities.interfaces;

namespace backend.app.services.implementations
{
    public sealed class LoginSecurityService : ILoginSecurityService
    {
        private const int MaxFailedAttempts = 5;
        private static readonly TimeSpan FailedAttemptWindow = TimeSpan.FromMinutes(15);
        private static readonly TimeSpan AccountLockDuration = TimeSpan.FromMinutes(30);
        private static readonly TimeSpan UnlockTokenLifetime = TimeSpan.FromHours(1);
        private static readonly TimeSpan KnownDevicesTtl = TimeSpan.FromDays(90);

        private const string FailedAttemptsKeyPrefix = "login_failed:";
        private const string AccountLockedKeyPrefix = "account_locked:";
        private const string UnlockTokenKeyPrefix = "unlock_token:";
        private const string KnownDevicesKeyPrefix = "known_devices:";

        private readonly ICacheService _cache;
        private readonly IEmailService _emailService;
        private readonly ICustomLogger _logger;

        public LoginSecurityService(
            ICacheService cache,
            IEmailService emailService,
            ICustomLogger logger
        )
        {
            _cache = cache;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task EnsureAccountNotLockedAsync(string email)
        {
            var key = AccountLockedKeyPrefix + NormalizeEmail(email);
            if (await _cache.KeyExistsAsync(key))
                throw new AccountLockedException();
        }

        public async Task RecordFailedAttemptAsync(string email, string ipAddress)
        {
            var normalizedEmail = NormalizeEmail(email);
            var key = FailedAttemptsKeyPrefix + normalizedEmail;

            var count = await _cache.IncrementAsync(key);

            if (count == 1)
                await _cache.SetExpiryAsync(key, FailedAttemptWindow);

            if (count >= MaxFailedAttempts)
            {
                await LockAccountAsync(normalizedEmail);
                await _cache.DeleteKeyAsync(key);
                _logger.Warn(
                    $"[LoginSecurity] Account locked for {normalizedEmail} after {count} failed attempts from IP {ipAddress}."
                );
            }
        }

        public async Task RecordSuccessfulLoginAsync(
            int userId,
            string email,
            string ipAddress,
            string clientName,
            string deviceType
        )
        {
            var normalizedEmail = NormalizeEmail(email);
            var failedKey = FailedAttemptsKeyPrefix + normalizedEmail;
            await _cache.DeleteKeyAsync(failedKey);

            var devicesKey = KnownDevicesKeyPrefix + userId;
            var fingerprint = BuildFingerprint(clientName, deviceType, ipAddress);

            var isKnown = await _cache.SetAddAsync(devicesKey, fingerprint);

            // SetAddAsync returns true when the element was newly added
            if (isKnown)
            {
                var existingDevices = await _cache.SetMembersAsync(devicesKey);
                var isFirstDevice = existingDevices.Length <= 1;

                if (!isFirstDevice)
                {
                    _logger.Info(
                        $"[LoginSecurity] New device detected for user {userId}: {fingerprint}"
                    );
                    try
                    {
                        await _emailService.SendNewDeviceLoginEmailAsync(
                            email,
                            ipAddress,
                            clientName,
                            deviceType,
                            DateTime.UtcNow
                        );
                    }
                    catch (Exception ex)
                    {
                        _logger.Error(
                            $"[LoginSecurity] Failed to send new device email for user {userId}: {ex.Message}"
                        );
                    }
                }
            }

            await _cache.SetExpiryAsync(devicesKey, KnownDevicesTtl);
        }

        public async Task<bool> UnlockAccountAsync(string unlockToken)
        {
            if (string.IsNullOrWhiteSpace(unlockToken))
                return false;

            var tokenKey = UnlockTokenKeyPrefix + unlockToken;
            var email = await _cache.GetValueAsync(tokenKey);

            if (email is null)
                return false;

            var lockedKey = AccountLockedKeyPrefix + email;
            await _cache.DeleteKeyAsync(lockedKey);
            await _cache.DeleteKeyAsync(tokenKey);

            _logger.Info($"[LoginSecurity] Account unlocked for {email} via token.");
            return true;
        }

        private async Task LockAccountAsync(string normalizedEmail)
        {
            var lockedKey = AccountLockedKeyPrefix + normalizedEmail;
            await _cache.SetValueAsync(lockedKey, "1", AccountLockDuration);

            var unlockToken = GenerateUnlockToken();
            var tokenKey = UnlockTokenKeyPrefix + unlockToken;
            await _cache.SetValueAsync(tokenKey, normalizedEmail, UnlockTokenLifetime);

            try
            {
                await _emailService.SendAccountLockedEmailAsync(normalizedEmail, unlockToken);
            }
            catch (Exception ex)
            {
                _logger.Error(
                    $"[LoginSecurity] Failed to send account locked email to {normalizedEmail}: {ex.Message}"
                );
            }
        }

        private static string GenerateUnlockToken()
        {
            var bytes = new byte[48];
            RandomNumberGenerator.Fill(bytes);
            return Convert.ToBase64String(bytes);
        }

        private static string BuildFingerprint(
            string clientName,
            string deviceType,
            string ipAddress
        )
        {
            return $"{clientName}:{deviceType}:{ipAddress}";
        }

        private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
    }
}
