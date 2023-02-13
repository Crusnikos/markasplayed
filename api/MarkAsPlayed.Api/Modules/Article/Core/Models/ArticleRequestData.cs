using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Article.Core.Models;

/// <summary>
///     Article creation request
/// </summary>
public class ArticleRequestData
{
    /// <summary>
    ///     Article title
    /// </summary>
    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string Title { get; init; } = default!;

    /// <summary>
    ///     Played on the platform
    /// </summary>
    public int? PlayedOn { get; init; }

    /// <summary>
    ///     Available on the platforms
    /// </summary>
    public IReadOnlyList<int>? AvailableOn { get; init; }

    /// <summary>
    ///     Game producer
    /// </summary>
    [StringLength(50, MinimumLength = 1)]
    public string? Producer { get; init; }

    /// <summary>
    ///     Hours spent in game
    /// </summary>
    [Range(1, 1000)]
    public int? PlayTime { get; init; }

    /// <summary>
    ///     Introduction to the article
    /// </summary>
    [Required]
    [StringLength(400, MinimumLength = 1)]
    public string ShortDescription { get; init; } = default!;

    /// <summary>
    ///     Main article
    /// </summary>
    [Required]
    [StringLength(10000, MinimumLength = 1)]
    public string LongDescription { get; init; } = default!;

    /// <summary>
    ///     Article Type
    /// </summary>
    [Required]
    public int ArticleType { get; init; }
}
