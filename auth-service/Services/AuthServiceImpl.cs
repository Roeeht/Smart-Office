using AuthService.Data;
using AuthService.DTOs;
using AuthService.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services;

/// <summary>
/// Implementation of authentication operations.
/// Handles user registration, login, and JWT token generation.
/// </summary>
public class AuthServiceImpl : IAuthService
{
    private readonly AuthDbContext _context;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IJwtService _jwtService;
    private readonly ILogger<AuthServiceImpl> _logger;

    public AuthServiceImpl(
        AuthDbContext context,
        IPasswordHasher<User> passwordHasher,
        IJwtService jwtService,
        ILogger<AuthServiceImpl> logger)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
    {
        // Check if username already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Name == request.Name);

        if (existingUser != null)
        {
            _logger.LogWarning("Registration failed: Username {Name} already exists", request.Name);
            return null;
        }

        // Create new user with Member role (never allow self-registration as Admin)
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            PasswordHash = string.Empty, // Will be set below
            Role = UserRoles.Member // Always Member on registration
        };

        // Hash the password using ASP.NET Core Identity's PasswordHasher
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        _logger.LogInformation("User {Name} registered successfully with role {Role}", user.Name, user.Role);

        // Generate and return JWT token
        return _jwtService.GenerateToken(user);
    }

    /// <inheritdoc />
    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        // Find user by username
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Name == request.Name);

        if (user == null)
        {
            _logger.LogWarning("Login failed: User {Name} not found", request.Name);
            return null;
        }

        // Verify password against stored hash
        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

        if (result == PasswordVerificationResult.Failed)
        {
            _logger.LogWarning("Login failed: Invalid password for user {Name}", request.Name);
            return null;
        }

        _logger.LogInformation("User {Name} logged in successfully", user.Name);

        // Generate and return JWT token
        return _jwtService.GenerateToken(user);
    }
}
