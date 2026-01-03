using AuthService.DTOs;
using AuthService.Services;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers;

/// <summary>
/// Controller handling authentication endpoints.
/// Provides user registration and login functionality.
/// </summary>
[ApiController]
[Route("")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    /// <summary>
    /// Registers a new user account.
    /// All registrations create Member accounts - Admin accounts can only be seeded.
    /// </summary>
    /// <param name="request">Registration details including name and password.</param>
    /// <returns>JWT token on success, or error details on failure.</returns>
    [HttpPost("register")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Validation Error",
                Detail = "One or more validation errors occurred.",
                Status = StatusCodes.Status400BadRequest,
                Extensions = { ["errors"] = ModelState }
            });
        }

        var result = await _authService.RegisterAsync(request);

        if (result == null)
        {
            return Conflict(new ProblemDetails
            {
                Title = "Registration Failed",
                Detail = "A user with this name already exists.",
                Status = StatusCodes.Status409Conflict
            });
        }

        _logger.LogInformation("User {Name} registered successfully", request.Name);
        return Created(string.Empty, result);
    }

    /// <summary>
    /// Authenticates a user and returns a JWT token.
    /// </summary>
    /// <param name="request">Login details including name and password.</param>
    /// <returns>JWT token on success, or 401 Unauthorized on failure.</returns>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Validation Error",
                Detail = "One or more validation errors occurred.",
                Status = StatusCodes.Status400BadRequest,
                Extensions = { ["errors"] = ModelState }
            });
        }

        var result = await _authService.LoginAsync(request);

        if (result == null)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Authentication Failed",
                Detail = "Invalid username or password.",
                Status = StatusCodes.Status401Unauthorized
            });
        }

        _logger.LogInformation("User {Name} logged in successfully", request.Name);
        return Ok(result);
    }

    /// <summary>
    /// Health check endpoint for container orchestration.
    /// </summary>
    /// <returns>OK status if the service is healthy.</returns>
    [HttpGet("health")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Health()
    {
        return Ok(new { status = "healthy", service = "auth-service", timestamp = DateTime.UtcNow });
    }
}
