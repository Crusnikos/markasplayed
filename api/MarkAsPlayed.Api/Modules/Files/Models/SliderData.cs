using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Files.Models;

public class SliderData : ImageData
{
    /// <summary>
    ///     Article title
    /// </summary>
    [Required]
    public string ArticleTitle { get; set; } = default!;
}
