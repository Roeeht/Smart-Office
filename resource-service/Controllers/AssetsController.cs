using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResourceService.DTOs;
using ResourceService.Services;

namespace ResourceService.Controllers;

/// <summary>
/// Controller handling asset management endpoints.
/// Requires authentication for all endpoints.
/// POST requires Admin role.
/// </summary>
[ApiController]
[Route("assets")]
[Authorize] // All endpoints require authentication
public class AssetsController : ControllerBase
{
    private readonly IAssetService _assetService;
    private readonly ILogger<AssetsController> _logger;

    public AssetsController(IAssetService assetService, ILogger<AssetsController> logger)
    {
        _assetService = assetService;
        _logger = logger;
    }

    /// <summary>
    /// Retrieves all assets.
    /// Available to any authenticated user (Admin or Member).
    /// </summary>
    /// <returns>List of all assets.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<AssetResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAssets()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        _logger.LogInformation("User {UserId} requesting all assets", userId);

        var assets = await _assetService.GetAllAssetsAsync();
        return Ok(assets);
    }

    /// <summary>
    /// Creates a new asset.
    /// Restricted to Admin users only.
    /// </summary>
    /// <param name="request">Asset creation details.</param>
    /// <returns>The created asset.</returns>
    [HttpPost]
    [Authorize(Policy = "RequireAdminRole")] // Only Admin can create assets
    [ProducesResponseType(typeof(AssetResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateAsset([FromBody] CreateAssetRequest request)
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

        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        _logger.LogInformation(
            "Admin user {UserId} creating asset: {Name} ({Type})",
            userId, request.Name, request.Type);

        var asset = await _assetService.CreateAssetAsync(request);
        return Created($"/assets/{asset.Id}", asset);
    }
}

/// <summary>
/// Health check controller for container orchestration.
/// </summary>
[ApiController]
[Route("")]
public class HealthController : ControllerBase
{
    /// <summary>
    /// Health check endpoint.
    /// </summary>
    /// <returns>OK status if the service is healthy.</returns>
    [HttpGet("health")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Health()
    {
        return Ok(new { status = "healthy", service = "resource-service", timestamp = DateTime.UtcNow });
    }
}
