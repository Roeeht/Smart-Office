using ResourceService.DTOs;

namespace ResourceService.Services;

/// <summary>
/// Interface for asset management operations.
/// </summary>
public interface IAssetService
{
    /// <summary>
    /// Retrieves all assets from the database.
    /// Available to any authenticated user.
    /// </summary>
    /// <returns>List of all assets.</returns>
    Task<IEnumerable<AssetResponse>> GetAllAssetsAsync();

    /// <summary>
    /// Creates a new asset in the database.
    /// Restricted to Admin users only.
    /// </summary>
    /// <param name="request">Asset creation details.</param>
    /// <returns>The created asset with generated ID.</returns>
    Task<AssetResponse> CreateAssetAsync(CreateAssetRequest request);
}
