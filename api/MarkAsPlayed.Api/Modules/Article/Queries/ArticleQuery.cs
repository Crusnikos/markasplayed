using MarkAsPlayed.Api.Modules.Article.Models;
using MarkAsPlayed.Api.Data;
using LinqToDB;
using MarkAsPlayed.Api.Pagination;

namespace MarkAsPlayed.Api.Modules.Article.Queries;

public sealed class ArticleQuery
{
    private readonly Database.Factory _databaseFactory;
    private const int DefaultPageSize = 5;

    public ArticleQuery(Database.Factory databaseFactory)
    {
        _databaseFactory = databaseFactory;
    }

    public async Task<IEnumerable<LookupData>> GetArticleLookupTable(
        string lookupName,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();

        var result = lookupName switch
        {
            "genres" => await db.Genres.
                Select(g => new LookupData 
                { 
                    Id = g.Id, 
                    Name = g.Name 
                }).
                ToListAsync(cancellationToken),
            "gamingPlatforms" => await db.GamingPlatforms.
                Select(gp => new LookupData 
                { 
                    Id = gp.Id, 
                    Name = gp.Name 
                }).
                ToListAsync(cancellationToken),
            _ => throw new InvalidOperationException(lookupName)
        };

        return new List<LookupData>(result);
    }

    public async Task<FullArticleData> GetArticleById(
        int articleId,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();

        var platformsSubquery =
            from articlePlatforms in db.ArticleGamingPlatforms
            where articlePlatforms.ArticleId == articleId
            from platforms in db.GamingPlatforms.InnerJoin(l => l.Id == articlePlatforms.GamingPlatformId)
            select new LookupData 
            { 
                Id = platforms.Id, 
                Name = platforms.Name 
            };

        var platformsList = await platformsSubquery.ToListAsync(cancellationToken);

        var articleData = await (
            from article in db.Articles.Where(a => a.Id == articleId)
            from playedOn in db.GamingPlatforms.InnerJoin(gp => gp.Id == article.GamingPlatformId).DefaultIfEmpty()
            from genre in db.Genres.InnerJoin(g => g.Id == article.GenreId)
            from author in db.Authors.InnerJoin(a => a.Id == article.CreatedBy)
            select new
            {
                article,
                playedOn = new LookupData
                {
                    Id = playedOn.Id,
                    Name = playedOn.Name
                },
                genre = new LookupData
                {
                    Id = genre.Id,
                    Name = genre.Name
                },
                author = new LookupData
                {
                    Id = author.Id,
                    Name= author.Name
                }
            }).FirstOrDefaultAsync(cancellationToken);

        if (articleData is null)
        {
            throw new ArgumentNullException(nameof(articleData));
        }

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
            Genre = articleData.genre,
            CreatedBy = articleData.author
        };
    }

    public async Task<Paginated<DashboardArticleData>> GetArticleListing(
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
                PlatformName = platforms.Name
            };

        var articleSubquery =
            from article in db.Articles
            from playedOn in db.GamingPlatforms.InnerJoin(gp => gp.Id == article.GamingPlatformId).DefaultIfEmpty()
            from genre in db.Genres.InnerJoin(g => g.Id == article.GenreId)
            from author in db.Authors.InnerJoin(a => a.Id == article.CreatedBy)
            select new
            {
                article,
                playedOn = new LookupData
                {
                    Id = playedOn.Id,
                    Name = playedOn.Name
                },
                genre = new LookupData
                {
                    Id = genre.Id,
                    Name = genre.Name
                },
                author = new LookupData
                {
                    Id= author.Id,
                    Name= author.Name
                }
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
                AvailableOn = AssignPlatformsToArticle(q.article.Id, platformsSubquery),
                Producer = q.article.Producer,
                CreatedAt = q.article.CreatedAt,
                ShortDescription = q.article.ShortDescription,
                Genre = q.genre,
            }).
            OrderByDescending(q => q.Id).
            Skip(pageOffset).
            Take(DefaultPageSize).
            ToListAsync(cancellationToken);

        return new Paginated<DashboardArticleData>(listing, requestPage, count.Result);
    }

    public IEnumerable<LookupData> AssignPlatformsToArticle(long articleId, IQueryable<PlatformData> subquery)
    {
        return 
            subquery.Where(s => s.ArticleId == articleId).
                Select(s => new LookupData
                {
                    Id = s.PlatformId,
                    Name = s.PlatformName
                }).ToList();
    }
}
