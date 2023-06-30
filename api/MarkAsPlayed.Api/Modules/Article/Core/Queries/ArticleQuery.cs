using MarkAsPlayed.Api.Modules.Article.Core.Models;
using MarkAsPlayed.Api.Data;
using LinqToDB;
using MarkAsPlayed.Api.Pagination;
using MarkAsPlayed.Api.Lookups;

namespace MarkAsPlayed.Api.Modules.Article.Core.Queries;

public sealed class ArticleQuery
{
    private readonly Database.Factory _databaseFactory;
    private readonly IArticleHelper _articleHelper;
    private const int DefaultPageSize = 5;

    public ArticleQuery(Database.Factory databaseFactory, IArticleHelper articleHelper)
    {
        _databaseFactory = databaseFactory;
        _articleHelper = articleHelper;
    }

    public async Task<FullArticleData?> GetSingleArticleAsync(long articleId)
    {
        await using var db = _databaseFactory();

        var platformsList = _articleHelper.GetPlatformsList(db, articleId).
            Select(pl => new LookupData
            {
                Id = pl.PlatformId,
                Name = pl.PlatformName,
                GroupName = pl.PlatformGroupName
            });

        var article =
            (from articleMetadata
                in db.Articles.Where(am => am.Id == articleId)
             from articleReviewData
                 in db.ArticlesReviewData.LeftJoin(ard => ard.ArticleId == articleMetadata.Id)
             from articleContent
                in db.ArticlesContent.InnerJoin(ard => ard.ArticleId == articleMetadata.Id)
             from playedOn
                 in db.GamingPlatforms.LeftJoin(gp => gp.Id == articleReviewData.PlayedOnGamingPlatformId)
             from articleType
                 in db.ArticleTypes.InnerJoin(at => at.Id == articleMetadata.ArticleTypeId)
             from author
                 in db.Authors.InnerJoin(a => a.Id == articleMetadata.CreatedBy)
             select new FullArticleData
             {
                 Id = articleMetadata.Id,
                 Title = articleMetadata.Title,
                 PlayedOn = new LookupData
                 {
                     Id = playedOn.Id,
                     Name = playedOn.Name,
                     GroupName = playedOn.GroupName,
                 },
                 AvailableOn = platformsList,
                 Producer = articleReviewData.Producer,
                 PlayTime = articleReviewData.PlayTime,
                 CreatedAt = articleMetadata.CreatedAt,
                 ShortDescription = articleMetadata.ShortDescription,
                 LongDescription = articleContent.LongDescription,
                 ArticleType = new LookupData
                 {
                     Id = articleType.Id,
                     Name = articleType.Name,
                     GroupName = articleType.GroupName
                 },
                 CreatedBy = new LookupData
                 {
                     Id = author.Id,
                     Name = author.Name
                 }
             }).FirstOrDefault();

        if (article is null)
            return null;
        else
            return article;
    }

    public async Task<Paginated<DashboardArticleData>> GetListingAsync(int requestPage)
    {
        await using var db = _databaseFactory();

        var platformsList = _articleHelper.GetPlatformsList(db);
        var articleSubquery =
            from articleMetadata
                in db.Articles
            from articleReviewData
                in db.ArticlesReviewData.LeftJoin(ard => ard.ArticleId == articleMetadata.Id)
            from playedOn 
                in db.GamingPlatforms.LeftJoin(gp => gp.Id == articleReviewData.PlayedOnGamingPlatformId)
            from articleType 
                in db.ArticleTypes.InnerJoin(at => at.Id == articleMetadata.ArticleTypeId)
            select new DashboardArticleData
            {
                Id = articleMetadata.Id,
                Title = articleMetadata.Title,
                PlayedOn = new LookupData
                {
                    Id = playedOn.Id,
                    Name = playedOn.Name,
                    GroupName = playedOn.GroupName,
                },
                AvailableOn = platformsList.
                    Where(pl => pl.ArticleId == articleMetadata.Id).
                    Select(pl => new LookupData 
                    { 
                        Id = pl.PlatformId, 
                        Name = pl.PlatformName, 
                        GroupName = pl.PlatformGroupName 
                    }),
                Producer = articleReviewData.Producer,
                CreatedAt = articleMetadata.CreatedAt,
                ShortDescription = articleMetadata.ShortDescription,
                ArticleType = new LookupData
                {
                    Id = articleType.Id,
                    Name = articleType.Name,
                    GroupName = articleType.GroupName
                }
            };

        var pageOffset = DefaultPageSize * (requestPage - 1);
        var count = articleSubquery.Count();

        if (count <= pageOffset)
            return new Paginated<DashboardArticleData>(
                new List<DashboardArticleData>(), 
                requestPage, 
                count
            );

        var listing = articleSubquery.
            OrderByDescending(q => q.Id).
            Skip(pageOffset).
            Take(DefaultPageSize).
            ToList();

        return new Paginated<DashboardArticleData>(listing, requestPage, count);
    }
}
