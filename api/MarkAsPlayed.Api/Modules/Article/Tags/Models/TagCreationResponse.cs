namespace MarkAsPlayed.Api.Modules.Article.Tags.Models;

public class TagCreationResponse
{
    /// <summary>
    ///     Tag http status code
    /// </summary>
    public TagStatus Status { get; set; }

    /// <summary>
    ///     Tag exception
    /// </summary>
    public Exception? ExceptionCaptured { get; set; }
}
