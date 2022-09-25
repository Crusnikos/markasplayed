using LinqToDB;
using MarkAsPlayed.Api.Data;
using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Modules.Article.Core.Models;

namespace MarkAsPlayed.Api.Modules.Article.Core.Commands;

public sealed class ArticleCommand
{
    private readonly Database.Factory _databaseFactory;

    public ArticleCommand(Database.Factory databaseFactory)
    {
        _databaseFactory = databaseFactory;
    }

    public async Task<ArticleCreationResponse> CreateAsync(
        ArticleRequestData request,
        string authorOfRequest,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();

        try
        {
            await using var transaction = await db.BeginTransactionAsync(cancellationToken);

            var author = await db.Authors.Where(a => a.FirebaseId == authorOfRequest).FirstOrDefaultAsync(cancellationToken);

            if (author is null)
            {
                return new ArticleCreationResponse 
                { 
                    Identifier = null, 
                    Status = ArticleStatus.NotFound, 
                    ExceptionCaptured = null 
                };
            }

            var trimmedLongDescription = request.LongDescription.Trim();
            var trimmedShortDescription = request.ShortDescription.Trim();

            var identifier = await db.Articles.InsertWithInt64IdentityAsync(
                () => new Data.Models.Article
                {
                    Title = request.Title,
                    Producer = request.Producer,
                    PlayTime = request.PlayTime,
                    LongDescription = trimmedLongDescription,
                    ShortDescription = trimmedShortDescription,
                    PlayedOnGamingPlatformId = request.PlayedOn,
                    ArticleTypeId = request.ArticleType,
                    CreatedBy = author.Id
                },
                cancellationToken
            );

            var platforms = request.AvailableOn ?? Enumerable.Empty<int>();

            foreach (var platform in platforms.Distinct())
            {
                await db.ArticleGamingPlatforms.InsertAsync(
                    () => new ArticleGamingPlatform
                    {
                        ArticleId = identifier,
                        GamingPlatformId = platform
                    },
                    cancellationToken
                );
            }

            await transaction.CommitAsync(cancellationToken);

            return new ArticleCreationResponse 
            { 
                Identifier = identifier, 
                Status = ArticleStatus.OK, 
                ExceptionCaptured = null 
            };
        } 
        catch (Exception exception)
        {
            return new ArticleCreationResponse 
            { 
                Identifier = null, 
                Status = ArticleStatus.InternalError, 
                ExceptionCaptured = exception 
            };
        }
    }

    public async Task<ArticleUpdateResponse> UpdateAsync(
        int id,
        ArticleRequestData request,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();

        try
        {
            await using var transaction = await db.BeginTransactionAsync(cancellationToken);

            var oldArticleData = await db.Articles.Where(a => a.Id == id).FirstOrDefaultAsync(cancellationToken);
            var trimmedLongDescription = request.LongDescription.Trim();
            var trimmedShortDescription = request.ShortDescription.Trim();

            var updatedRecords = await db.Articles.Where(a => a.Id == id).
                Set(a => a.CreatedAt, oldArticleData!.CreatedAt).
                Set(a => a.PlayedOnGamingPlatformId, request.PlayedOn).
                Set(a => a.ArticleTypeId, request.ArticleType).
                Set(a => a.LongDescription, trimmedLongDescription).
                Set(a => a.ShortDescription, trimmedShortDescription).
                Set(a => a.PlayTime, request.PlayTime).
                Set(a => a.Producer, request.Producer).
                Set(a => a.Title, request.Title).
                Set(a => a.CreatedBy, oldArticleData!.CreatedBy).
                UpdateAsync(cancellationToken);

            if (updatedRecords == 0)
            {
                return new ArticleUpdateResponse
                {
                    Identifier = null,
                    Status = ArticleStatus.Forbidden,
                    ExceptionCaptured = null
                };
            }

            await db.ArticleGamingPlatforms.DeleteAsync(p => p.ArticleId == id, cancellationToken);

            var platforms = request.AvailableOn ?? Enumerable.Empty<int>();

            foreach (var platform in platforms.Distinct())
            {
                await db.ArticleGamingPlatforms.InsertAsync(
                    () => new ArticleGamingPlatform
                    {
                        ArticleId = (long)id!,
                        GamingPlatformId = platform
                    },
                    cancellationToken
                );
            }

            await transaction.CommitAsync(cancellationToken);

            return new ArticleUpdateResponse
            {
                Identifier = null,
                Status = ArticleStatus.NoContent,
                ExceptionCaptured = null
            };
        }
        catch (Exception exception)
        {
            return new ArticleUpdateResponse
            {
                Identifier = id,
                Status = ArticleStatus.InternalError,
                ExceptionCaptured = exception
            };
        }
    }
}
