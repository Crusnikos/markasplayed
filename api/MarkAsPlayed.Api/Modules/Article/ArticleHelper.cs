using LinqToDB;
using MarkAsPlayed.Api.Data;
using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Modules.Article.Core.Models;
using MarkAsPlayed.Api.Modules.Article.Tags.Models;
using System.Threading;

namespace MarkAsPlayed.Api.Modules.Article;

class ArticleHelper : IArticleHelper
{
    #region Article

    public async Task<long> InsertArticleAsync(
        Database database,
        ArticleRequestData request,
        int authorId,
        CancellationToken cancellationToken)
    {
        var trimmedShortDescription = request.ShortDescription.Trim();

        try
        {
            return await database.Articles.InsertWithInt64IdentityAsync(
                () => new Data.Models.Article
                {
                    Title = request.Title,
                    ShortDescription = trimmedShortDescription,
                    ArticleTypeId = request.ArticleType,
                    CreatedBy = authorId
                },
                cancellationToken
            );
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task InsertArticleContentAsync(
        Database database,
        ArticleRequestData request,
        long identifier,
        CancellationToken cancellationToken)
    {
        var trimmedLongDescription = request.LongDescription.Trim();

        try
        {
            await database.ArticlesContent.InsertAsync(
                () => new ArticleContent
                {
                    ArticleId = identifier,
                    LongDescription = trimmedLongDescription
                },
                cancellationToken
            );
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task InsertArticleStatisticsAsync(
        Database database,
        long identifier,
        CancellationToken cancellationToken)
    {
        try
        {
            await database.ArticlesStatistics.InsertAsync(
                () => new ArticleStatistics
                {
                    ArticleId = identifier
                },
                cancellationToken
            );
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task InsertArticleReviewDataAsync(
        Database database,
        ArticleRequestData request,
        long identifier,
        CancellationToken cancellationToken)
    {
        try
        {
            await database.ArticlesReviewData.InsertAsync(
                () => new ArticleReviewData
                {
                    ArticleId = identifier,
                    PlayedOnGamingPlatformId = request.PlayedOn ?? 0,
                    PlayTime = request.PlayTime ?? 0,
                    Producer = request.Producer ?? String.Empty
                },
                cancellationToken
            );
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task InsertArticleGamingPlatformAsync(
        Database database,
        long identifier,
        int platform,
        CancellationToken cancellationToken)
    {
        try
        {
            await database.ArticleGamingPlatforms.InsertAsync(
                () => new ArticleGamingPlatform
                {
                    ArticleId = identifier,
                    GamingPlatformId = platform
                },
                cancellationToken
            );
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<int> UpdateArticleAsync(
        Database database,
        ArticleRequestData request,
        Data.Models.Article oldArticleData,
        int articleId,
        CancellationToken cancellationToken)
    {
        var trimmedShortDescription = request.ShortDescription.Trim();

        try
        {
            return await database.Articles.Where(a => a.Id == articleId).
               Set(a => a.CreatedAt, oldArticleData!.CreatedAt).
               Set(a => a.ArticleTypeId, (int)request.ArticleType).
               Set(a => a.ShortDescription, trimmedShortDescription).
               Set(a => a.Title, request.Title).
               Set(a => a.CreatedBy, oldArticleData!.CreatedBy).
               UpdateAsync(cancellationToken);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task UpdateArticleContentAsync(
        Database database,
        ArticleRequestData request,
        int articleId,
        CancellationToken cancellationToken)
    {
        var trimmedLongDescription = request.LongDescription.Trim();

        try
        {
            await database.ArticlesContent.Where(a => a.ArticleId == articleId).
                Set(a => a.ArticleId, articleId).
                Set(a => a.LongDescription, trimmedLongDescription).
                UpdateAsync(cancellationToken);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<int> UpdateArticleReviewDataAsync(
        Database database,
        ArticleRequestData request,
        int articleId,
        CancellationToken cancellationToken)
    {
        try
        {
            return await database.ArticlesReviewData.Where(a => a.ArticleId == articleId).
                Set(a => a.ArticleId, articleId).
                Set(a => a.Producer, request.Producer).
                Set(a => a.PlayedOnGamingPlatformId, request.PlayedOn).
                Set(a => a.PlayTime, request.PlayTime).
                UpdateAsync(cancellationToken);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public IList<PlatformData> GetPlatformsList(Database database, long? articleId = null)
    {
        var platformsSubquery =
            from articlePlatforms
                in database.ArticleGamingPlatforms
            from platforms
                in database.GamingPlatforms.InnerJoin(gp => gp.Id == articlePlatforms.GamingPlatformId)
            select new PlatformData
            {
                ArticleId = articlePlatforms.ArticleId,
                PlatformId = platforms.Id,
                PlatformName = platforms.Name,
                PlatformGroupName = platforms.GroupName
            };

        if (articleId != null)
            return platformsSubquery.Where(a => a.ArticleId == articleId).ToList();

        return platformsSubquery.ToList();
    }

    #endregion

    #region Tag

    public async Task InsertArticleTagAsync(Database database, TagRequestData request, CancellationToken cancellationToken = default)
    {
        try
        {
            await database.ArticleTags.InsertAsync(
                () => new ArticleTag
                {
                    ArticleId = request.ArticleId,
                    TagId = request.TagId,
                    IsActive = true
                },
                cancellationToken
            );
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<int> UpdateArticleTagAsync(
        Database database, 
        TagRequestData request,
        bool isActive,
        CancellationToken cancellationToken = default)
    {
        try
        {
            return await database.ArticleTags.
                Where(at =>
                    at.ArticleId == request.ArticleId &&
                    at.TagId == request.TagId).
                Set(at => at.ArticleId, request.ArticleId).
                Set(at => at.TagId, request.TagId).
                Set(at => at.IsActive, isActive).
                UpdateAsync(cancellationToken);
        }
        catch (Exception)
        {
            throw;
        }
    }

    #endregion
}
