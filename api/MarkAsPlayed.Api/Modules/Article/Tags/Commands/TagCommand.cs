using LinqToDB;
using MarkAsPlayed.Api.Data;
using MarkAsPlayed.Api.Modules.Article.Tags.Models;
using Npgsql;

namespace MarkAsPlayed.Api.Modules.Article.Tags.Commands;

public class TagCommand
{
    private readonly Database.Factory _databaseFactory;

    public TagCommand(Database.Factory databaseFactory)
    {
        _databaseFactory = databaseFactory;
    }

    public async Task<CommonResponseTemplate> CreateAsync(
        TagRequestData request,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();

        try
        {
            var updatedRecords = await db.ArticleTags.
                Where(at => 
                    at.ArticleId == request.ArticleId && 
                    at.TagId == request.TagId).
                Set(at => at.ArticleId, request.ArticleId).
                Set(at => at.TagId, request.TagId).
                Set(at => at.IsActive, true).
                UpdateAsync(cancellationToken);

            if (updatedRecords == 0)
            {
                await db.ArticleTags.InsertAsync(
                    () => new Data.Models.ArticleTag
                    {
                        ArticleId = request.ArticleId,
                        TagId = request.TagId,
                        IsActive = true
                    },
                    cancellationToken
                );
            }

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
            var updatedRecords = await db.ArticleTags.
                Where(at =>
                    at.ArticleId == request.ArticleId &&
                    at.TagId == request.TagId).
                Set(at => at.ArticleId, request.ArticleId).
                Set(at => at.TagId, request.TagId).
                Set(at => at.IsActive, false).
                UpdateAsync(cancellationToken);

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
