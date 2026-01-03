using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AuthService.DTOs;
using AuthService.Models;
using Microsoft.IdentityModel.Tokens;

namespace AuthService.Services;

/// <summary>
/// Implementation of JWT token generation.
/// Uses HMAC-SHA256 symmetric signing with configurable settings from environment variables.
/// </summary>
public class JwtService : IJwtService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<JwtService> _logger;

    public JwtService(IConfiguration configuration, ILogger<JwtService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    /// <inheritdoc />
    public AuthResponse GenerateToken(User user)
    {
        // Get JWT settings from configuration (environment variables in production)
        var secret = _configuration["JWT_SECRET"]
            ?? throw new InvalidOperationException("JWT_SECRET is not configured");
        var issuer = _configuration["JWT_ISSUER"]
            ?? throw new InvalidOperationException("JWT_ISSUER is not configured");
        var audience = _configuration["JWT_AUDIENCE"]
            ?? throw new InvalidOperationException("JWT_AUDIENCE is not configured");

        // Default to 30 minutes, configurable via JWT_EXP_MINUTES
        var expirationMinutes = int.Parse(_configuration["JWT_EXP_MINUTES"] ?? "30");

        // Create signing credentials using HMAC-SHA256
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Define claims to include in the token
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("role", user.Role), // Duplicate for easier frontend access
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
        };

        var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);

        // Create the JWT token
        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        _logger.LogInformation(
            "JWT token generated for user {UserId} with role {Role}, expires at {ExpiresAt}",
            user.Id, user.Role, expiresAt);

        return new AuthResponse
        {
            Token = tokenString,
            ExpiresAt = expiresAt,
            Role = user.Role
        };
    }
}
