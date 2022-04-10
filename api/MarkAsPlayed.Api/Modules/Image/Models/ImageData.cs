using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Image.Models;

public class ImageData
{
    [Required]
    public long Id { get; set; }

    [Required]
    public string ImageName { get; set; } = default!;

    [Required]
    public string ImageSrc { get; set; } = default!;
}
