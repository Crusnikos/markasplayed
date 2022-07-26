using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Image.Models;

public class GalleryUpdateRequest
{
    [Required]
    public IReadOnlyList<int> GalleryIds { get; init; } = default!;
}
