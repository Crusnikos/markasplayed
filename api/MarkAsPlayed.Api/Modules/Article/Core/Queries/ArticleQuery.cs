using MarkAsPlayed.Api.Modules.Article.Core.Models;
using MarkAsPlayed.Api.Data;
using LinqToDB;
using MarkAsPlayed.Api.Pagination;
using MarkAsPlayed.Api.Lookups;

namespace MarkAsPlayed.Api.Modules.Article.Core.Queries;

public sealed class ArticleQuery
{
    private readonly Database.Factory _databaseFactory;
    private const int DefaultPageSize = 5;

    public ArticleQuery(Database.Factory databaseFactory)
    {
        _databaseFactory = databaseFactory;
    }

    public async Task<FullArticleData?> GetSingleArticleAsync(
        int articleId,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();

        var articleData = await (
            from article in db.Articles.Where(a => a.Id == articleId)
            from playedOn in db.GamingPlatforms.LeftJoin(gp => gp.Id == article.PlayedOnGamingPlatformId)
            from articleType in db.ArticleTypes.InnerJoin(g => g.Id == article.ArticleTypeId)
            from author in db.Authors.InnerJoin(a => a.Id == article.CreatedBy)
            select new
            {
                article,
                playedOn = new LookupData
                {
                    Id = playedOn.Id,
                    Name = playedOn.Name,
                    GroupName = playedOn.GroupName,
                },
                articleType = new LookupData
                {
                    Id = articleType.Id,
                    Name = articleType.Name,
                    GroupName = articleType.GroupName,
                },
                author = new LookupData
                {
                    Id = author.Id,
                    Name = author.Name
                }
            }).FirstOrDefaultAsync(cancellationToken);

        if (articleData is null)
        {
            return null;
        }

        var platformsSubquery =
            from articlePlatforms in db.ArticleGamingPlatforms
            where articlePlatforms.ArticleId == articleId
            from platforms in db.GamingPlatforms.InnerJoin(l => l.Id == articlePlatforms.GamingPlatformId)
            select new LookupData
            {
                Id = platforms.Id,
                Name = platforms.Name,
                GroupName= platforms.GroupName,
            };

        var platformsList = await platformsSubquery.ToListAsync(cancellationToken);

        return new FullArticleData
        {
            Id = articleData.article.Id,
            Title = articleData.article.Title,
            PlayedOn = articleData.playedOn,
            AvailableOn = platformsList,
            Producer = articleData.article.Producer,
            PlayTime = articleData.article.PlayTime,
            CreatedAt = articleData.article.CreatedAt,
            ShortDescription = articleData.article.ShortDescription,
            LongDescription = articleData.article.LongDescription,
            ArticleType = articleData.articleType,
            CreatedBy = articleData.author
        };
    }

    public async Task<Paginated<DashboardArticleData>> GetListingAsync(
        int requestPage,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();

        var platformsSubquery =
            from articlePlatforms in db.ArticleGamingPlatforms
            from platforms in db.GamingPlatforms.InnerJoin(gp => gp.Id == articlePlatforms.GamingPlatformId)
            select new PlatformData
            {
                ArticleId = articlePlatforms.ArticleId,
                PlatformId = articlePlatforms.GamingPlatformId,
                PlatformName = platforms.Name,
                PlatformGroupName = platforms.GroupName
            };

        var articleSubquery =
            from article in db.Articles
            from playedOn in db.GamingPlatforms.LeftJoin(gp => gp.Id == article.PlayedOnGamingPlatformId)
            from articleType in db.ArticleTypes.InnerJoin(g => g.Id == article.ArticleTypeId)
            from author in db.Authors.InnerJoin(a => a.Id == article.CreatedBy)
            select new
            {
                article,
                playedOn = new LookupData
                {
                    Id = playedOn.Id,
                    Name = playedOn.Name,
                    GroupName = playedOn.GroupName,
                },
                articleType = new LookupData
                {
                    Id = articleType.Id,
                    Name = articleType.Name,
                    GroupName= articleType.GroupName
                },
                author = new LookupData
                {
                    Id= author.Id,
                    Name= author.Name
                },
                platforms = platformsSubquery.
                    Where(ps => ps.ArticleId == article.Id).
                    Select(q => new LookupData
                    {
                        Id = q.PlatformId,
                        Name = q.PlatformName,
                        GroupName = q.PlatformGroupName
                    }).ToList()
            };

        var pageOffset = DefaultPageSize * (requestPage - 1);

        var count = articleSubquery.CountAsync(cancellationToken);

        if (count.Result <= pageOffset)
        {
            return new Paginated<DashboardArticleData>(new List<DashboardArticleData>(), requestPage, count.Result);
        }

        var listing = await articleSubquery.Select(
            q => new DashboardArticleData
            {
                Id = q.article.Id,
                Title = q.article.Title,
                PlayedOn = q.playedOn,
                AvailableOn = q.platforms,
                Producer = q.article.Producer,
                CreatedAt = q.article.CreatedAt,
                ShortDescription = q.article.ShortDescription,
                ArticleType = q.articleType,
            }).
            OrderByDescending(q => q.Id).
            Skip(pageOffset).
            Take(DefaultPageSize).
            ToListAsync(cancellationToken);

        return new Paginated<DashboardArticleData>(listing, requestPage, count.Result);
    }
}
