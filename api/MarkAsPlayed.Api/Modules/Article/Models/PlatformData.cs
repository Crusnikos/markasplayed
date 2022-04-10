using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Article.Models;

public class PlatformData
{
    [Required]
    public long ArticleId { get; set; }

    [Required]
    public int PlatformId { get; set; }

    [Required]
    public string PlatformName { get; set; } = default!;
}
