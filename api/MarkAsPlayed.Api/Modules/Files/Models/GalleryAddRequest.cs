using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Files.Models;

/// <summary>
///     Add to gallery request
/// </summary>
public class GalleryAddRequest
{
    /// <summary>
    ///     Files list
    /// </summary>
    [Required]
    public IReadOnlyList<IFormFile> Files { get; init; } = default!;
}
