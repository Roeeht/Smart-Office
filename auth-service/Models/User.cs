namespace AuthService.Models;

/// <summary>
/// Represents a user in the system with authentication credentials and role assignment.
/// Stored in PostgreSQL via Entity Framework Core.
/// </summary>
public class User
{
    /// <summary>
    /// Unique identifier for the user. Generated as a new GUID on creation.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Username for authentication. Must be unique across all users.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Hashed password using ASP.NET Core Identity PasswordHasher.
    /// Never stores plain text passwords.
    /// </summary>
    public required string PasswordHash { get; set; }

    /// <summary>
    /// User's role determining their access level.
    /// Either "Admin" or "Member". Defaults to "Member" on registration.
    /// </summary>
    public string Role { get; set; } = UserRoles.Member;
}

/// <summary>
/// Constants for user roles to avoid magic strings throughout the codebase.
/// </summary>
public static class UserRoles
{
    public const string Admin = "Admin";
    public const string Member = "Member";
}
