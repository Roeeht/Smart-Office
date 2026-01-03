using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ResourceService.Models;

/// <summary>
/// Represents an office asset such as a desk, room, or equipment.
/// Stored in MongoDB with native ObjectId.
/// </summary>
public class Asset
{
    /// <summary>
    /// Unique identifier using MongoDB's native ObjectId.
    /// Serialized as string in API responses for frontend consumption.
    /// </summary>
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    /// <summary>
    /// Human-readable name of the asset.
    /// Examples: "Desk A1", "Conference Room B", "Projector 3"
    /// </summary>
    [BsonElement("name")]
    public required string Name { get; set; }

    /// <summary>
    /// Category or type of the asset.
    /// Examples: "Desk", "Room", "Equipment", "Vehicle"
    /// </summary>
    [BsonElement("type")]
    public required string Type { get; set; }

    /// <summary>
    /// Current availability or condition status.
    /// Examples: "Available", "Occupied", "Maintenance", "Reserved"
    /// </summary>
    [BsonElement("status")]
    public required string Status { get; set; }

    /// <summary>
    /// Timestamp when the asset was created.
    /// </summary>
    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
