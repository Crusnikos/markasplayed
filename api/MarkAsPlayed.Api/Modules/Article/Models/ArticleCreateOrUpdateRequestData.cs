using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Article.Models;

public class ArticleCreateOrUpdateRequestData
{
    public int? Id { get; init; }

    [Required]
    public string Title { get; init; } = default!;

    public int? PlayedOn { get; init; }

    public IReadOnlyList<int>? AvailableOn { get; init; }

    public string? Producer { get; init; }

    public int? PlayTime { get; init; }

    [Required]
    public string ShortDescription { get; init; } = default!;

    [Required]
    public string LongDescription { get; init; } = default!;

    [Required]
    public int Genre { get; init; }
}
