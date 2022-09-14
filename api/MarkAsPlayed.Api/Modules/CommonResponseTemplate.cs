namespace MarkAsPlayed.Api.Modules;

public class CommonResponseTemplate
{
    /// <summary>
    ///     Article identifier
    /// </summary>
    public long? ArticleIdentifier { get; set; }

    /// <summary>
    ///     Tag identifier
    /// </summary>
    public int? TagIdentifier { get; set; }

    /// <summary>
    ///     HTTP status code
    /// </summary>
    public StatusCodesHelper Status { get; set; }

    /// <summary>
    ///     Exception
    /// </summary>
    public Exception? ExceptionCaptured { get; set; }

    /// <summary>
    ///     Operation name
    /// </summary>
    public string Message { get; set; } = default!;
}
