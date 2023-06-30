using LinqToDB;
using MarkAsPlayed.Api.Data;
using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Modules.Article.Core.Models;
using MarkAsPlayed.Api.Modules.Article.Tags.Models;
using Newtonsoft.Json;

namespace MarkAsPlayed.Api.Modules.Article;

class ArticleHelper : IArticleHelper
{
    #region Article

    public async Task<long> InsertArticleAsync(
        Database database,
        ArticleFoundationData request,
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
        ArticleFoundationData request,
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
        ArticleFoundationData request,
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

    public async Task InsertArticleHistoryRecord(Database database,
        long id, List<Variance> variances, string requestor,
        string transactionId, DateTimeOffset? createdAt, CancellationToken cancellationToken)
    {
        try
        {
            if (variances.Count == 0) return;

            var author = database.Authors.Where(a => a.FirebaseId == requestor).FirstOrDefault();
            if (author == null) return;

            var json = JsonConvert.SerializeObject(variances);

            await database.ArticleVersionHistory.InsertAsync(
                () => new ArticleVersionHistory
                {
                    ArticleId = id,
                    TransactionId = transactionId,
                    CreatedAt = createdAt ?? DateTime.Now,
                    CreatedBy = author.Id,
                    Differences = json
                },
                cancellationToken
            );
        }
        catch (Exception)
        {
            return;
        }
    }

    public async Task<int> UpdateArticleAsync(
        Database database,
        ArticleFoundationData request,
        long articleId,
        CancellationToken cancellationToken)
    {
        var trimmedShortDescription = request.ShortDescription.Trim();

        try
        {
            var tmpArticle = database.Articles.First(a => a.Id == articleId);

            return await database.Articles.Where(a => a.Id == articleId).
               Set(a => a.CreatedAt, tmpArticle.CreatedAt).
               Set(a => a.ArticleTypeId, request.ArticleType).
               Set(a => a.ShortDescription, trimmedShortDescription).
               Set(a => a.Title, request.Title).
               Set(a => a.CreatedBy, tmpArticle.CreatedBy).
               UpdateAsync(cancellationToken);
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task UpdateArticleContentAsync(
        Database database,
        ArticleFoundationData request,
        long articleId,
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
        ArticleFoundationData request,
        long articleId,
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

    public ArticleFoundationData GetArticleFoundationData(Database database, long? articleId = null)
    {
        var platformsList = GetPlatformsList(database, articleId).Select(pl => pl.PlatformId).ToList();

        var article =
            (from articleMetadata
                in database.Articles.Where(am => am.Id == articleId)
             from articleReviewData
                 in database.ArticlesReviewData.LeftJoin(ard => ard.ArticleId == articleMetadata.Id)
             from articleContent
                in database.ArticlesContent.InnerJoin(ard => ard.ArticleId == articleMetadata.Id)
             from playedOn
                 in database.GamingPlatforms.LeftJoin(gp => gp.Id == articleReviewData.PlayedOnGamingPlatformId)
             from articleType
                 in database.ArticleTypes.InnerJoin(at => at.Id == articleMetadata.ArticleTypeId)
             select new ArticleFoundationData
             {
                 Title = articleMetadata.Title,
                 PlayedOn = playedOn.Id,
                 AvailableOn = platformsList,
                 Producer = articleReviewData.Producer,
                 PlayTime = articleReviewData.PlayTime,
                 ShortDescription = articleMetadata.ShortDescription,
                 LongDescription = articleContent.LongDescription,
                 ArticleType = articleMetadata.ArticleTypeId
             }).FirstOrDefault();

        if (article != null)
            return article;
        else
            return new ArticleFoundationData();
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
