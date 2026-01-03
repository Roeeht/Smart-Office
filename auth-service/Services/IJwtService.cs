using AuthService.DTOs;
using AuthService.Models;

namespace AuthService.Services;

/// <summary>
/// Interface for JWT token operations.
/// </summary>
public interface IJwtService
{
    /// <summary>
    /// Generates a JWT token for the authenticated user.
    /// Token includes UserId and Role claims.
    /// </summary>
    /// <param name="user">The authenticated user.</param>
    /// <returns>Authentication response containing the token and metadata.</returns>
    AuthResponse GenerateToken(User user);
}
