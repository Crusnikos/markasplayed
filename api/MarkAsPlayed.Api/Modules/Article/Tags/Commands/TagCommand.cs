using LinqToDB;
using MarkAsPlayed.Api.Data;
using MarkAsPlayed.Api.Modules.Article.Core.Models;
using MarkAsPlayed.Api.Modules.Article.Core;
using MarkAsPlayed.Api.Modules.Article.Tags.Models;
using System.Threading;

namespace MarkAsPlayed.Api.Modules.Article.Tags.Commands;

public class TagCommand
{
    private readonly Database.Factory _databaseFactory;

    public TagCommand(Database.Factory databaseFactory)
    {
        _databaseFactory = databaseFactory;
    }

    public async Task<TagCreationResponse> CreateAsync(
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

            return new TagCreationResponse
            {
                Status = TagStatus.OK,
                ExceptionCaptured = null
            };
        }
        catch (Exception exception)
        {
            return new TagCreationResponse
            {
                Status = TagStatus.InternalError,
                ExceptionCaptured = exception
            };
        }
    }

    public async Task<TagDeactivationResponse> DeactivateAsync(
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
                return new TagDeactivationResponse
                {
                    Status = TagStatus.Forbidden,
                    ExceptionCaptured = null
                };
            }

            return new TagDeactivationResponse
            {
                Status = TagStatus.OK,
                ExceptionCaptured = null
            };
        }
        catch (Exception exception)
        {
            return new TagDeactivationResponse
            {
                Status = TagStatus.InternalError,
                ExceptionCaptured = exception
            };
        }
    }
}
