using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Image.Models;

public class GalleryAddRequest
{
    [Required]
    public string Id { get; init; } = default!;

    [Required]
    public IReadOnlyList<IFormFile> Files { get; init; } = default!;
}
