using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Files.Models;

/// <summary>
///     Gallery update request
/// </summary>
public class GalleryUpdateRequest
{
    /// <summary>
    ///     Image id
    /// </summary>
    [Required]
    public int Id { get; init; } = default!;
}
