using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Files.Models;

/// <summary>
///     Change gallery request
/// </summary>
public class GalleryUpdateRequest
{
    /// <summary>
    ///     Files database ids
    /// </summary>
    [Required]
    public IReadOnlyList<int> GalleryIds { get; init; } = default!;
}
