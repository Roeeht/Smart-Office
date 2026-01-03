using MongoDB.Driver;
using ResourceService.DTOs;
using ResourceService.Models;

namespace ResourceService.Services;

/// <summary>
/// Implementation of asset management operations using MongoDB.
/// </summary>
public class AssetService : IAssetService
{
    private readonly IMongoCollection<Asset> _assets;
    private readonly ILogger<AssetService> _logger;

    public AssetService(IMongoDatabase database, ILogger<AssetService> logger)
    {
        _assets = database.GetCollection<Asset>("assets");
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<IEnumerable<AssetResponse>> GetAllAssetsAsync()
    {
        var assets = await _assets
            .Find(_ => true)
            .SortByDescending(a => a.CreatedAt)
            .ToListAsync();

        _logger.LogInformation("Retrieved {Count} assets", assets.Count);

        return assets.Select(MapToResponse);
    }

    /// <inheritdoc />
    public async Task<AssetResponse> CreateAssetAsync(CreateAssetRequest request)
    {
        var asset = new Asset
        {
            Name = request.Name,
            Type = request.Type,
            Status = request.Status,
            CreatedAt = DateTime.UtcNow
        };

        await _assets.InsertOneAsync(asset);

        _logger.LogInformation(
            "Asset created: {AssetId} - {Name} ({Type})",
            asset.Id, asset.Name, asset.Type);

        return MapToResponse(asset);
    }

    /// <summary>
    /// Maps an Asset entity to an AssetResponse DTO.
    /// </summary>
    private static AssetResponse MapToResponse(Asset asset)
    {
        return new AssetResponse
        {
            Id = asset.Id!,
            Name = asset.Name,
            Type = asset.Type,
            Status = asset.Status,
            CreatedAt = asset.CreatedAt
        };
    }
}
