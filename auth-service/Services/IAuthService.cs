using AuthService.DTOs;

namespace AuthService.Services;

/// <summary>
/// Interface for authentication operations.
/// Separates contract from implementation for testability.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Registers a new user with the provided credentials.
    /// Always assigns the "Member" role - Admin accounts are seeded only.
    /// </summary>
    /// <param name="request">Registration details including name and password.</param>
    /// <returns>Authentication response with JWT token, or null if registration fails.</returns>
    Task<AuthResponse?> RegisterAsync(RegisterRequest request);

    /// <summary>
    /// Authenticates a user with the provided credentials.
    /// </summary>
    /// <param name="request">Login details including name and password.</param>
    /// <returns>Authentication response with JWT token, or null if authentication fails.</returns>
    Task<AuthResponse?> LoginAsync(LoginRequest request);
}
