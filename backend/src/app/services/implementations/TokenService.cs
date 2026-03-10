using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.app.configurations.environment;
using backend.app.errors.http;
using backend.app.models.core;
using backend.app.services.interfaces;
using backend.app.utilities.interfaces;
using Microsoft.IdentityModel.Tokens;

namespace backend.app.services.implementations
{
    public sealed class TokenService : ITokenService
    {
        private const string Issuer = "SchoolSpace";
        private const string Audience = "SchoolSpaceConsumers";
        private const string RefreshTokenKeyPrefix = "refresh_token:";
        private const string VerificationTokenKeyPrefix = "verification_token:";
        private const string VerificationEmailKeyPrefix = "verification_email:";
        private static readonly TimeSpan AccessTokenLifetime = TimeSpan.FromMinutes(15);
        private static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(7);
        private static readonly TimeSpan VerificationTokenLifetime = TimeSpan.FromHours(24);

        private readonly ICacheService _cache;
        private readonly ICustomLogger _logger;
        private readonly IRandomTokenGenerator _tokenGenerator;
        private readonly SymmetricSecurityKey _signingKey;

        public TokenService(ICacheService cache, ICustomLogger logger, IRandomTokenGenerator tokenGenerator)
        {
            _cache = cache;
            _logger = logger;
            _tokenGenerator = tokenGenerator;
            _signingKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(EnvironmentSetting.JwtSecretKeyAccess)
            );
        }

        public string GenerateAccessToken(User user)
        {
            try
                {
                var claims = new List<Claim>
                {
                    new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new(ClaimTypes.Name, user.Email),
                    new(ClaimTypes.Role, user.Usertype.ToString()),
                };

                var creds = new SigningCredentials(_signingKey, SecurityAlgorithms.HmacSha256);
                var expires = DateTime.UtcNow.Add(AccessTokenLifetime);

                var token = new JwtSecurityToken(
                    issuer: Issuer,
                    audience: Audience,
                    claims: claims,
                    expires: expires,
                    signingCredentials: creds
                );

                return new JwtSecurityTokenHandler().WriteToken(token);
            }
            catch (Exception e)
            {
                if (e is AppException)
                    throw;

                _logger.Error($"[TokenService] GenerateAccessToken failed: {e}");
                throw new InternalServerErrorException();
            }
        }

        public async Task<string> GenerateRefreshToken(int userId)
        {
            try
            {
                var token = _tokenGenerator.Generate(64);

                var key = RefreshTokenKeyPrefix + token;
                await _cache.SetValueAsync(key, userId.ToString(), RefreshTokenLifetime);

                return token;
            }
            catch (Exception e)
            {
                if (e is AppException)
                    throw;

                _logger.Error($"[TokenService] GenerateRefreshToken failed: {e}");
                throw new InternalServerErrorException();
            }
        }

        public async Task<int?> ValidateRefreshToken(string refreshToken)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(refreshToken))
                    return null;

                var key = RefreshTokenKeyPrefix + refreshToken;
                var value = await _cache.GetValueAsync(key);
                if (value is null)
                    return null;

                return int.TryParse(value, out var userId) ? userId : null;
            }
            catch (Exception e)
            {
                if (e is AppException)
                    throw;

                _logger.Error($"[TokenService] ValidateRefreshToken failed: {e}");
                throw new InternalServerErrorException();
            }
        }

        public async Task<(string NewRefreshToken, int UserId)?> RotateRefreshTokenAsync(
            string refreshToken
        )
        {
            try
            {
                var userId = await ValidateRefreshToken(refreshToken);
                if (userId is null)
                    return null;

                var key = RefreshTokenKeyPrefix + refreshToken;
                await _cache.DeleteKeyAsync(key);

                var newToken = await GenerateRefreshToken(userId.Value);
                return (newToken, userId.Value);
                }
            catch (Exception e)
            {
                if (e is AppException)
                    throw;

                _logger.Error($"[TokenService] RotateRefreshTokenAsync failed: {e}");
                throw new InternalServerErrorException();
            }
        }

        public async Task<bool> InvalidateRefreshTokenAsync(string refreshToken)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(refreshToken))
                    return false;

                var key = RefreshTokenKeyPrefix + refreshToken;
                return await _cache.DeleteKeyAsync(key);
                }
            catch (Exception e)
            {
                if (e is AppException)
                    throw;

                _logger.Error($"[TokenService] InvalidateRefreshTokenAsync failed: {e}");
                throw new InternalServerErrorException();
            }
        }

        public async Task<string> GenerateVerificationToken(User user)
        {
            try
            {
                var token = _tokenGenerator.Generate(48);

                var tokenKey = VerificationTokenKeyPrefix + token;
                var emailKey = VerificationEmailKeyPrefix + user.Email;

                await _cache.SetValueAsync(tokenKey, user.Id.ToString(), VerificationTokenLifetime);
                await _cache.SetValueAsync(emailKey, token, VerificationTokenLifetime);

                return token;
                }
            catch (Exception e)
            {
                if (e is AppException)
                    throw;

                _logger.Error($"[TokenService] GenerateVerificationToken failed: {e}");
                throw new InternalServerErrorException();
            }
        }

        public async Task<int?> VerifyVerificationToken(string verifyToken)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(verifyToken))
                    return null;

                var key = VerificationTokenKeyPrefix + verifyToken;
                var value = await _cache.GetValueAsync(key);
                if (value is null)
                    return null;

                return int.TryParse(value, out var userId) ? userId : null;
                }
            catch (Exception e)
            {
                if (e is AppException)
                    throw;

                _logger.Error($"[TokenService] VerifyVerificationToken failed: {e}");
                throw new InternalServerErrorException();
            }
        }

        public async Task<string?> VerificationTokenExist(string email)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(email))
                    return null;

                var key = VerificationEmailKeyPrefix + email;
                return await _cache.GetValueAsync(key);
                }
            catch (Exception e)
            {
                if (e is AppException)
                    throw;

                _logger.Error($"[TokenService] VerificationTokenExist failed: {e}");
                throw new InternalServerErrorException();
            }
        }
    }
}
