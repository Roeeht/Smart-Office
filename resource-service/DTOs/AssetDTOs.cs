using System.ComponentModel.DataAnnotations;

namespace ResourceService.DTOs;

/// <summary>
/// Request DTO for creating a new asset.
/// Used by POST /assets endpoint (Admin only).
/// </summary>
public class CreateAssetRequest
{
    /// <summary>
    /// Human-readable name of the asset.
    /// </summary>
    [Required(ErrorMessage = "Name is required")]
    [StringLength(100, MinimumLength = 1, ErrorMessage = "Name must be between 1 and 100 characters")]
    public required string Name { get; set; }

    /// <summary>
    /// Category or type of the asset.
    /// </summary>
    [Required(ErrorMessage = "Type is required")]
    [StringLength(50, MinimumLength = 1, ErrorMessage = "Type must be between 1 and 50 characters")]
    public required string Type { get; set; }

    /// <summary>
    /// Current availability or condition status.
    /// </summary>
    [Required(ErrorMessage = "Status is required")]
    [StringLength(50, MinimumLength = 1, ErrorMessage = "Status must be between 1 and 50 characters")]
    public required string Status { get; set; }
}

/// <summary>
/// Response DTO for asset data.
/// Exposes MongoDB ObjectId as string for frontend consumption.
/// </summary>
public class AssetResponse
{
    /// <summary>
    /// Unique identifier (MongoDB ObjectId as string).
    /// </summary>
    public required string Id { get; set; }

    /// <summary>
    /// Human-readable name of the asset.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Category or type of the asset.
    /// </summary>
    public required string Type { get; set; }

    /// <summary>
    /// Current availability or condition status.
    /// </summary>
    public required string Status { get; set; }

    /// <summary>
    /// Timestamp when the asset was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }
}
