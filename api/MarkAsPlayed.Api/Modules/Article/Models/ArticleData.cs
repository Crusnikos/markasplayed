using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Article.Models;

public class FullArticleData : DashboardArticleData
{
    public int? PlayTime { get; set; }

    [Required]
    public string LongDescription { get; set; } = default!;

    [Required]
    public LookupData CreatedBy { get; set; } = default!;
}

public class DashboardArticleData
{
    public long Id { get; set; }

    [Required]
    public string Title { get; set; } = default!;

    public LookupData? PlayedOn { get; set; }

    public IEnumerable<LookupData>? AvailableOn { get; set; }

    public string? Producer { get; set; }

    [Required]
    public DateTimeOffset CreatedAt { get; set; }

    [Required]
    public string ShortDescription { get; set; } = default!;

    [Required]
    public LookupData Genre { get; set; } = default!;
}
