namespace MarkAsPlayed.Api.Modules.Article.Models;

public class ArticleCreationResponse
{
    /// <summary>
    ///     Article identifier
    /// </summary>
    public long? Identifier { get; set; }

    /// <summary>
    ///     Article http status code
    /// </summary>
    public ArticleStatus Status { get; set; }

    /// <summary>
    ///     Article exception
    /// </summary>
    public Exception? ExceptionCaptured { get; set; }
}
