using System.ComponentModel.DataAnnotations;

namespace AuthService.DTOs;

/// <summary>
/// Request DTO for user registration.
/// Validates input before processing.
/// </summary>
public class RegisterRequest
{
    /// <summary>
    /// Username for the new account. Must be 3-50 characters.
    /// </summary>
    [Required(ErrorMessage = "Name is required")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Name must be between 3 and 50 characters")]
    public required string Name { get; set; }

    /// <summary>
    /// Password for the new account. Must be at least 6 characters.
    /// Will be hashed before storage - never stored in plain text.
    /// </summary>
    [Required(ErrorMessage = "Password is required")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Password must be at least 6 characters")]
    public required string Password { get; set; }
}

/// <summary>
/// Request DTO for user login.
/// </summary>
public class LoginRequest
{
    /// <summary>
    /// Username of the account to authenticate.
    /// </summary>
    [Required(ErrorMessage = "Name is required")]
    public required string Name { get; set; }

    /// <summary>
    /// Password to verify against the stored hash.
    /// </summary>
    [Required(ErrorMessage = "Password is required")]
    public required string Password { get; set; }
}

/// <summary>
/// Response DTO for successful authentication.
/// Contains the JWT token for subsequent API calls.
/// </summary>
public class AuthResponse
{
    /// <summary>
    /// JWT token to be used in Authorization header as "Bearer {token}".
    /// Contains claims for UserId and Role.
    /// </summary>
    public required string Token { get; set; }

    /// <summary>
    /// Token expiration time in UTC.
    /// Client should refresh or re-authenticate before this time.
    /// </summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// User's role for client-side UI decisions.
    /// Backend authorization is the real enforcement.
    /// </summary>
    public required string Role { get; set; }
}
