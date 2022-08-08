using MarkAsPlayed.Api.Lookups;
using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Article.Models;

/// <summary>
///     Complete article data
/// </summary>
public class FullArticleData : DashboardArticleData
{
    /// <summary>
    ///     Hours spent in game
    /// </summary>
    public int? PlayTime { get; set; }

    /// <summary>
    ///     Main article
    /// </summary>
    [Required]
    public string LongDescription { get; set; } = default!;

    /// <summary>
    ///     Author of the article
    /// </summary>
    [Required]
    public LookupData CreatedBy { get; set; } = default!;
}

/// <summary>
///     Dashboard only article data
/// </summary>
public class DashboardArticleData
{
    /// <summary>
    ///     Article Id
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    ///     Article title
    /// </summary>
    [Required]
    public string Title { get; set; } = default!;

    /// <summary>
    ///     Played on the platform
    /// </summary>
    public LookupData? PlayedOn { get; set; }

    /// <summary>
    ///     Available on the platforms
    /// </summary>
    public IEnumerable<LookupData>? AvailableOn { get; set; }

    /// <summary>
    ///     Game producer
    /// </summary>
    public string? Producer { get; set; }

    /// <summary>
    ///     Article creation date
    /// </summary>
    [Required]
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    ///     Introduction to the article
    /// </summary>
    [Required]
    public string ShortDescription { get; set; } = default!;

    /// <summary>
    ///     Article Type
    /// </summary>
    [Required]
    public LookupData ArticleType { get; set; } = default!;
}
