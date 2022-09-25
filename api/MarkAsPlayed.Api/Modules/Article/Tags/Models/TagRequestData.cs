namespace MarkAsPlayed.Api.Modules.Article.Tags.Models;

/// <summary>
///     Tag creation or remove request
/// </summary>
public class TagRequestData
{
    /// <summary>
    ///     Article ID
    /// </summary>
    public int ArticleId { get; init; }

    /// <summary>
    ///     Tag ID
    /// </summary>
    public int TagId { get; init; }
}
