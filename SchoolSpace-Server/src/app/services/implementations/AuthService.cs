using backend.app.dtos.responses.auth;
using backend.app.errors.app;
using backend.app.errors.http;
using backend.app.models.core;
using backend.app.repositories.interfaces;
using backend.app.services.interfaces;
using backend.app.utilities.implementation;
using backend.app.utilities.interfaces;

namespace backend.app.services.implementations
{
    public sealed class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly ITokenService _tokenService;
        private readonly IOAuthService _oauthService;
        private readonly ICaptchaService _captchaService;
        private readonly ICustomLogger _logger;

        public AuthService(
            IUserRepository userRepository,
            ITokenService tokenService,
            IOAuthService oauthService,
            ICaptchaService captchaService,
            ICustomLogger logger
        )
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
            _oauthService = oauthService;
            _captchaService = captchaService;
            _logger = logger;
        }

        public async Task<AuthResult?> LoginAsync(
            string email,
            string password,
            string captcha,
            bool rememberMe = false
        )
        {
            try
            {
                var result = await _captchaService.VerifyCaptchaAsync(captcha);
                if (!result)
                    throw new UnauthorizedException("Invalid captcha token");

                var user = await _userRepository.GetUserByEmailAsync(email);
                if (user is null || user.Password is null)
                    throw new InvalidCredentialsException();

                if (!BCrypt.Net.BCrypt.Verify(password, user.Password))
                    throw new InvalidCredentialsException();

                if (user.Status != UserStatus.Active)
                    throw new UserNotActiveException();

                return await BuildAuthResultAsync(user);
            }
            catch (Exception e)
            {
                if (e is AppException)
                    throw;

                _logger.Error($"[AuthService] LoginAsync failed: {e}");
                throw new InternalServerErrorException();
            }
        }

        public async Task<AuthResult?> SignupAsync(
            string email,
            string password,
            string role,
            string captcha
        )
        {
            try
            {
                if (await _userRepository.EmailExistsAsync(email))
                    throw new EmailAlreadyExistsException();

                var selectedRole = ParseRole(role);
                var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);

                var user = new User
                {
                    Email = email,
                    Password = hashedPassword,
                    Usertype = selectedRole,
                    Status = UserStatus.Active,
                    Username = email,
                };

                user = await _userRepository.CreateUserAsync(user);

                return await BuildAuthResultAsync(user);
            }
            catch (Exception e)
            {
                if (e is AppException)
                    throw;

                _logger.Error($"[AuthService] SignupAsync failed: {e}");
                throw new InternalServerErrorException();
            }
        }

        public async Task<bool> VerifyAsync(string verificationToken)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(verificationToken))
                    throw new InvalidOrExpiredVerificationTokenException();

                var userId = await _tokenService.VerifyVerificationToken(verificationToken);
                if (userId is null)
                    throw new InvalidOrExpiredVerificationTokenException();

                var user = await _userRepository.GetUserAsync(userId.Value);
                if (user is null)
                    throw new ResourceNotFoundException("User not found.");

                var updated = new User
                {
                    Id = user.Id,
                    Email = user.Email,
                    Password = user.Password,
                    Usertype = user.Usertype,
                    Status = UserStatus.Active,
                    Username = user.Username,
                    Name = user.Name,
                    AvatarUrl = user.AvatarUrl,
                    Phone = user.Phone,
                    MicrosoftId = user.MicrosoftId,
                    GoogleId = user.GoogleId,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = DateTime.UtcNow,
                };

                return await _userRepository.UpdatePartialAsync(updated) is not null;
            }
            catch (Exception e)
            {
                if (e is AppException)
                    throw;

                _logger.Error($"[AuthService] LoginAsync failed: {e}");
                throw new InternalServerErrorException();
            }
        }

        public async Task<bool> ForgotPasswordAsync(string email)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(email))
                    return false;

                var user = await _userRepository.GetUserByEmailAsync(email);
                if (user is null)
                    return false;

                await _tokenService.GenerateVerificationToken(user);
                return true;
            }
            catch (Exception e)
            {
                if (e is AppException)
                    throw;

                _logger.Error($"[AuthService] ForgotPasswordAsync failed: {e}");
                throw new InternalServerErrorException();
            }
        }

        public async Task<bool> ChangePasswordAsync(string verificationToken, string newPassword)
        {
            try
            {
                if (
                    string.IsNullOrWhiteSpace(verificationToken)
                    || string.IsNullOrWhiteSpace(newPassword)
                )
                    throw new InvalidOrExpiredVerificationTokenException();

                var userId = await _tokenService.VerifyVerificationToken(verificationToken);
                if (userId is null)
                    throw new InvalidOrExpiredVerificationTokenException();

                var user = await _userRepository.GetUserAsync(userId.Value);
                if (user is null)
                    throw new ResourceNotFoundException("User not found.");

                var hashedPassword = BCrypt.Net.BCrypt.HashPassword(newPassword);
                var updated = new User
                {
                    Id = user.Id,
                    Email = user.Email,
                    Password = hashedPassword,
                    Usertype = user.Usertype,
                    Status = user.Status,
                    Username = user.Username,
                    Name = user.Name,
                    AvatarUrl = user.AvatarUrl,
                    Phone = user.Phone,
                    MicrosoftId = user.MicrosoftId,
                    GoogleId = user.GoogleId,
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = DateTime.UtcNow,
                };

                return await _userRepository.UpdatePartialAsync(updated) is not null;
            }
            catch (Exception e)
            {
                if (e is AppException)
                    throw;

                _logger.Error($"[AuthService] ChangePasswordAsync failed: {e}");
                throw new InternalServerErrorException();
            }
        }

        public async Task<AuthResult?> RefreshAsync(string refreshToken)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(refreshToken))
                    throw new InvalidOrExpiredRefreshTokenException();

                var rotated = await _tokenService.RotateRefreshTokenAsync(refreshToken);
                if (rotated is null)
                    throw new InvalidOrExpiredRefreshTokenException();

                var user = await _userRepository.GetUserAsync(rotated.Value.UserId);
                if (user is null)
                    throw new ResourceNotFoundException("User not found.");
                if (user.Status != UserStatus.Active)
                    throw new UserNotActiveException();

                var accessToken = _tokenService.GenerateAccessToken(user);
                return new AuthResult
                {
                    AccessToken = accessToken,
                    RefreshToken = rotated.Value.NewRefreshToken,
                    UserId = user.Id,
                    Username = user.Username ?? user.Email,
                    Role = user.Usertype.ToString(),
                    AvatarUrl = user.AvatarUrl,
                };
            }
            catch (Exception e)
            {
                if (e is AppException)
                    throw;

                _logger.Error($"[AuthService] RefreshAsync failed: {e}");
                throw new InternalServerErrorException();
            }
        }

        public async Task<bool> LogoutAsync(string refreshToken)
        {
            try
            {
                return await _tokenService.InvalidateRefreshTokenAsync(refreshToken);
            }
            catch (Exception e)
            {
                if (e is AppException)
                    throw;

                _logger.Error($"[AuthService] LogoutAsync failed: {e}");
                throw new InternalServerErrorException();
            }
        }

        public async Task<AuthResult?> LoginWithGoogleAsync(string googleToken)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(googleToken))
                    throw new InvalidCredentialsException();

                var oauthUser = await _oauthService.VerifyGoogleTokenAsync(googleToken);
                var user = await _userRepository.GetUserByGoogleIdAsync(oauthUser.Id);

                if (user is null)
                {
                    user = await _userRepository.GetUserByEmailAsync(oauthUser.Email);
                    if (user is not null)
                        await _userRepository.UpdateProviderIdsAsync(user.Id, oauthUser.Id, null);
                    else
                    {
                        user = await _userRepository.CreateUserAsync(
                            new User
                            {
                                Email = oauthUser.Email,
                                Username = oauthUser.Email,
                                Name = oauthUser.Name,
                                Password = null,
                                Usertype = UserRole.Student,
                                Status = UserStatus.Active,
                                GoogleId = oauthUser.Id,
                            }
                        );
                    }
                }

                if (user.Status != UserStatus.Active)
                    throw new UserNotActiveException();

                return await BuildAuthResultAsync(user);
            }
            catch (Exception e)
            {
                if (e is AppException)
                    throw;

                _logger.Error($"[AuthService] LoginWithGoogleAsync failed: {e}");
                throw new InternalServerErrorException();
            }
        }

        public async Task<AuthResult?> LoginWithMicrosoftAsync(string microsoftToken)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(microsoftToken))
                    throw new InvalidCredentialsException();

                var oauthUser = await _oauthService.VerifyMicrosoftTokenAsync(microsoftToken);
                var user = await _userRepository.GetUserByMicrosoftIdAsync(oauthUser.Id);

                if (user is null)
                {
                    user = await _userRepository.GetUserByEmailAsync(oauthUser.Email);
                    if (user is not null)
                        await _userRepository.UpdateProviderIdsAsync(user.Id, null, oauthUser.Id);
                    else
                    {
                        user = await _userRepository.CreateUserAsync(
                            new User
                            {
                                Email = oauthUser.Email,
                                Username = oauthUser.Email,
                                Name = oauthUser.Name,
                                Password = null,
                                Usertype = UserRole.Student,
                                Status = UserStatus.Active,
                                MicrosoftId = oauthUser.Id,
                            }
                        );
                    }
                }

                if (user.Status != UserStatus.Active)
                    throw new UserNotActiveException();

                return await BuildAuthResultAsync(user);
            }
            catch (Exception e)
            {
                if (e is AppException)
                    throw;

                _logger.Error($"[AuthService] LoginWithMicrosoftAsync failed: {e}");
                throw new InternalServerErrorException();
            }
        }

        private async Task<AuthResult> BuildAuthResultAsync(User user)
        {
            try
            {
                var accessToken = _tokenService.GenerateAccessToken(user);
                var refreshToken = await _tokenService.GenerateRefreshToken(user.Id);

                return new AuthResult
                {
                    AccessToken = accessToken,
                    RefreshToken = refreshToken,
                    UserId = user.Id,
                    Username = user.Username ?? user.Email,
                    Role = user.Usertype.ToString(),
                    AvatarUrl = user.AvatarUrl,
                };
            }
            catch (Exception e)
            {
                if (e is AppException)
                    throw;

                _logger.Error($"[AuthService] BuildAuthResultAsync failed: {e}");
                throw new InternalServerErrorException();
            }
        }

        private static UserRole ParseRole(string role)
        {
            return role.ToLowerInvariant() switch
            {
                "teacher" => UserRole.Teacher,
                "assistant" => UserRole.Admin,
                _ => UserRole.Student,
            };
        }
    }
}
