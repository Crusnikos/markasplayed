using LinqToDB;
using MarkAsPlayed.Api.Data;
using MarkAsPlayed.Api.Modules.Article.Tags.Models;
using Npgsql;

namespace MarkAsPlayed.Api.Modules.Article.Tags.Commands;

public class TagCommand
{
    private readonly Database.Factory _databaseFactory;
    private readonly IArticleHelper _articleHelper;

    public TagCommand(Database.Factory databaseFactory, IArticleHelper articleHelper)
    {
        _databaseFactory = databaseFactory;
        _articleHelper = articleHelper;
    }

    public async Task<CommonResponseTemplate> CreateAsync(
        TagRequestData request,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();

        try
        {
            var updatedRecords = await _articleHelper.UpdateArticleTagAsync(db, request, true, cancellationToken);

            if (updatedRecords == 0)
                await _articleHelper.InsertArticleTagAsync(db, request, cancellationToken);

            return new CommonResponseTemplate
            {
                ArticleIdentifier = request.ArticleId,
                TagIdentifier = request.TagId,
                Status = StatusCodesHelper.NoContent,
                ExceptionCaptured = null,
                Message = "Tag successfully activated"
            };
        }
        catch (PostgresException exception) when (exception.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            return new CommonResponseTemplate
            {
                ArticleIdentifier = request.ArticleId,
                TagIdentifier = request.TagId,
                Status = StatusCodesHelper.NotFound,
                ExceptionCaptured = exception,
                Message = "Database rejected data"
            };
        }
        catch (Exception exception)
        {
            return new CommonResponseTemplate
            {
                ArticleIdentifier = request.ArticleId,
                TagIdentifier = request.TagId,
                Status = StatusCodesHelper.InternalError,
                ExceptionCaptured = exception,
                Message = "Failed to activate tag"
            };
        }
    }

    public async Task<CommonResponseTemplate> DeactivateAsync(
        TagRequestData request,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();

        try
        {
            var updatedRecords = await _articleHelper.UpdateArticleTagAsync(db, request, false, cancellationToken);

            if (updatedRecords == 0)
            {
                return new CommonResponseTemplate
                {
                    ArticleIdentifier = request.ArticleId,
                    TagIdentifier = request.TagId,
                    Status = StatusCodesHelper.NotFound,
                    ExceptionCaptured = null,
                    Message = "Failed to deactivate tag"
                };
            }

            return new CommonResponseTemplate
            {
                ArticleIdentifier = request.ArticleId,
                TagIdentifier = request.TagId,
                Status = StatusCodesHelper.NoContent,
                ExceptionCaptured = null,
                Message = "Tag successfully deactivated"
            };
        }
        catch (Exception exception)
        {
            return new CommonResponseTemplate
            {
                ArticleIdentifier = request.ArticleId,
                TagIdentifier = request.TagId,
                Status = StatusCodesHelper.InternalError,
                ExceptionCaptured = exception,
                Message = "Failed to deactivate tag"
            };
        }
    }
}
