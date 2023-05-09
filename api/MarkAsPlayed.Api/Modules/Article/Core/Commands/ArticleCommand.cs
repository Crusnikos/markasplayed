using LinqToDB;
using MarkAsPlayed.Api.Data;
using MarkAsPlayed.Api.Modules.Article.Core.Models;
using Npgsql;

namespace MarkAsPlayed.Api.Modules.Article.Core.Commands;

public sealed class ArticleCommand
{
    private readonly Database.Factory _databaseFactory;
    private readonly IArticleHelper _articleHelper;

    public ArticleCommand(Database.Factory databaseFactory, IArticleHelper articleHelper)
    {
        _databaseFactory = databaseFactory;
        _articleHelper = articleHelper;
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

            var author = db.Authors.Where(a => a.FirebaseId == authorOfRequest).FirstOrDefault();
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

            var identifier = await _articleHelper.InsertArticleAsync(db, request, author.Id, cancellationToken);
            await _articleHelper.InsertArticleContentAsync(db, request, identifier, cancellationToken);
            await _articleHelper.InsertArticleStatisticsAsync(db, identifier, cancellationToken);

            if (request.ArticleType == (int)ArticleTypeHelper.review)
            {
                await _articleHelper.InsertArticleReviewDataAsync(db, request, identifier, cancellationToken);
            }

            var platforms = request.AvailableOn ?? Enumerable.Empty<int>();
            foreach (var platform in platforms.Distinct())
            {
                await _articleHelper.InsertArticleGamingPlatformAsync(db, identifier, platform, cancellationToken);
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

            var updatedArticleRecords = await _articleHelper.UpdateArticleAsync(db, request, oldArticleData, id, cancellationToken);
            if (updatedArticleRecords == 0)
            {
                return new CommonResponseTemplate
                {
                    ArticleIdentifier = id,
                    Status = StatusCodesHelper.NotFound,
                    ExceptionCaptured = null,
                    Message = "Failed to update article"
                };
            }

            await _articleHelper.UpdateArticleContentAsync(db, request, id, cancellationToken);

            if (request.ArticleType == (int)ArticleTypeHelper.review)
            {
                var updatedArticleReviewDataRecords = await _articleHelper.UpdateArticleReviewDataAsync(db, request, id, cancellationToken);

                if (updatedArticleReviewDataRecords == 0)
                    await _articleHelper.InsertArticleReviewDataAsync(db, request, id, cancellationToken);
            }
            else
                await db.ArticlesReviewData.DeleteAsync(p => p.ArticleId == id, cancellationToken);

            await db.ArticleGamingPlatforms.DeleteAsync(p => p.ArticleId == id, cancellationToken);
            if (request.ArticleType != (int)ArticleTypeHelper.other)
            {
                var platforms = request.AvailableOn ?? Enumerable.Empty<int>();
                foreach (var platform in platforms.Distinct())
                {
                    await _articleHelper.InsertArticleGamingPlatformAsync(db, (long)id!, platform, cancellationToken);
                }
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
