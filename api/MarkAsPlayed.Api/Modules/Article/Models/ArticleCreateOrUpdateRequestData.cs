using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Article.Models;

public class ArticleCreateOrUpdateRequestData
{
    [Range(1, int.MaxValue)]
    public int? Id { get; init; }

    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string Title { get; init; } = default!;

    public int? PlayedOn { get; init; }

    public IReadOnlyList<int>? AvailableOn { get; init; }

    [StringLength(50, MinimumLength = 1)]
    public string? Producer { get; init; }

    [Range(1, 1000)]
    public int? PlayTime { get; init; }

    [Required]
    [StringLength(400, MinimumLength = 1)]
    public string ShortDescription { get; init; } = default!;

    [Required]
    [StringLength(5000, MinimumLength = 1)]
    public string LongDescription { get; init; } = default!;

    [Required]
    public int Genre { get; init; }
}
