using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Article.Tags.Models;

/// <summary>
///     Tag creation or remove request
/// </summary>
public class TagRequestData
{
    /// <summary>
    ///     Article ID
    /// </summary>
    [Range(1, int.MaxValue)]
    public int ArticleId { get; init; }

    /// <summary>
    ///     Tag ID
    /// </summary>
    [Range(1, int.MaxValue)]
    public int TagId { get; init; }
}
