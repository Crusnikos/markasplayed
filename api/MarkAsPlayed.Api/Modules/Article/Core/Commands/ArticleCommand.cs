using LinqToDB;
using MarkAsPlayed.Api.Data;
using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Modules.Article.Core.Models;
using Npgsql;

namespace MarkAsPlayed.Api.Modules.Article.Core.Commands;

public sealed class ArticleCommand
{
    private readonly Database.Factory _databaseFactory;

    public ArticleCommand(Database.Factory databaseFactory)
    {
        _databaseFactory = databaseFactory;
    }

    public async Task<CommonResponseTemplate> CreateAsync(
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
                return new CommonResponseTemplate
                {
                    ArticleIdentifier = null,
                    Status = StatusCodesHelper.NotFound,
                    ExceptionCaptured = null,
                    Message = "Author does not exist"
                };
            }

            if (request.ArticleType == (int)ArticleTypeHelper.review && 
                !request.AvailableOn!.Any(ao => ao == request.PlayedOn!.Value))
            {
                return new CommonResponseTemplate
                {
                    ArticleIdentifier = null,
                    Status = StatusCodesHelper.UnprocessableContent,
                    ExceptionCaptured = null,
                    Message = "Platform list is invalid (missing playedOn value)"
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
                    ArticleTypeId = (int)request.ArticleType,
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

            return new CommonResponseTemplate 
            { 
                ArticleIdentifier = identifier, 
                Status = StatusCodesHelper.OK,
                ExceptionCaptured = null,
                Message = "Article successfully added"
            };
        }
        catch (PostgresException exception) when (exception.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            return new CommonResponseTemplate
            {
                ArticleIdentifier = null,
                Status = StatusCodesHelper.NotFound,
                ExceptionCaptured = exception,
                Message = "Database rejected data"
            };
        }
        catch (Exception exception)
        {
            return new CommonResponseTemplate
            {
                ArticleIdentifier = null,
                Status = StatusCodesHelper.InternalError, 
                ExceptionCaptured = exception,
                Message = "Failed to add article"
            };
        }
    }

    public async Task<CommonResponseTemplate> UpdateAsync(
        int id,
        ArticleRequestData request,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();

        try
        {
            await using var transaction = await db.BeginTransactionAsync(cancellationToken);

            var oldArticleData = await db.Articles.Where(a => a.Id == id).FirstOrDefaultAsync(cancellationToken);

            if (oldArticleData is null)
            {
                return new CommonResponseTemplate
                {
                    ArticleIdentifier = id,
                    Status = StatusCodesHelper.NotFound,
                    ExceptionCaptured = null,
                    Message = "Article does not exist"
                };
            }

            if (request.ArticleType == (int)ArticleTypeHelper.review &&
                !request.AvailableOn!.Any(ao => ao == request.PlayedOn!.Value))
            {
                return new CommonResponseTemplate
                {
                    ArticleIdentifier = null,
                    Status = StatusCodesHelper.UnprocessableContent,
                    ExceptionCaptured = null,
                    Message = "Platform list is invalid (missing playedOn value)"
                };
            }

            var trimmedLongDescription = request.LongDescription.Trim();
            var trimmedShortDescription = request.ShortDescription.Trim();

            var updatedRecords = await db.Articles.Where(a => a.Id == id).
                Set(a => a.CreatedAt, oldArticleData!.CreatedAt).
                Set(a => a.PlayedOnGamingPlatformId, request.PlayedOn).
                Set(a => a.ArticleTypeId, (int)request.ArticleType).
                Set(a => a.LongDescription, trimmedLongDescription).
                Set(a => a.ShortDescription, trimmedShortDescription).
                Set(a => a.PlayTime, request.PlayTime).
                Set(a => a.Producer, request.Producer).
                Set(a => a.Title, request.Title).
                Set(a => a.CreatedBy, oldArticleData!.CreatedBy).
                UpdateAsync(cancellationToken);

            if (updatedRecords == 0)
            {
                return new CommonResponseTemplate
                {
                    ArticleIdentifier = id,
                    Status = StatusCodesHelper.NotFound,
                    ExceptionCaptured = null,
                    Message = "Failed to update article"
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

            return new CommonResponseTemplate
            {
                ArticleIdentifier = null,
                Status = StatusCodesHelper.NoContent,
                ExceptionCaptured = null,
                Message = "Article successfully updated"
            };
        }
        catch (PostgresException exception) when (exception.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            return new CommonResponseTemplate
            {
                ArticleIdentifier = id,
                Status = StatusCodesHelper.NotFound,
                ExceptionCaptured = exception,
                Message = "Database rejected data"
            };
        }
        catch (Exception exception)
        {
            return new CommonResponseTemplate
            {
                ArticleIdentifier = id,
                Status = StatusCodesHelper.InternalError,
                ExceptionCaptured = exception,
                Message = "Failed to update article"
            };
        }
    }
}
