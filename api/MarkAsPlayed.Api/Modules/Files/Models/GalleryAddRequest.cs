using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Files.Models;

/// <summary>
///     Add to gallery request
/// </summary>
public class GalleryAddRequest
{
    /// <summary>
    ///     File data
    /// </summary>
    [Required]
    public IFormFile File { get; init; } = default!;
}
