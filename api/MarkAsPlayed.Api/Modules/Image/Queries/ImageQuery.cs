using LinqToDB;
using MarkAsPlayed.Api.Data;
using MarkAsPlayed.Api.Modules.Image.Models;

namespace MarkAsPlayed.Api.Modules.Image.Queries;

public sealed class ImageQuery
{
    private readonly Database.Factory _databaseFactory;
    private const int DefaultPageSize = 5;
    private const string DefaultFrontImageName = "Main.webp";
    private const string DefaultSmallFrontImageName = "MainSmall.webp";

    public ImageQuery(Database.Factory databaseFactory)
    {
        _databaseFactory = databaseFactory;
    }

    public async Task<ImageData> GetFrontImageById(
        int articleId,
        string scheme,
        string host,
        bool small)
    {
        await using var db = _databaseFactory();

        if (!db.Articles.Any(a => a.Id == articleId))
        {
            throw new ArgumentNullException(nameof(articleId));
        }

        return new ImageData
        {
            Id = articleId,
            ImageName = DefaultFrontImageName,
            ImageSrc = string.Format("{0}://{1}/Image/{2}/{3}",
                scheme,
                host,
                articleId.ToString(),
                small ? DefaultSmallFrontImageName : DefaultFrontImageName
            )
        };
    }

    public async Task<IEnumerable<ImageData>> GetSliderImages(
        string scheme,
        string host,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();

        return await db.Articles.Select(
            q => new ImageData
            {
                Id = q.Id,
                ImageName = DefaultFrontImageName,
                ImageSrc = string.Format("{0}://{1}/Image/{2}/{3}", scheme, host, q.Id.ToString(), DefaultFrontImageName
            )
            }).
            OrderByDescending(q => q.Id).
            Take(DefaultPageSize).
            ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<ImageData>> GetArticleGallery(
        int articleId,
        string scheme,
        string host,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();

        if (!db.Articles.Any(a => a.Id == articleId))
        {
            throw new ArgumentNullException(nameof(articleId));
        }

        return await db.ArticleGallery.
            Where(ag => ag.ArticleId == articleId).
            Where(ag => ag.IsActive == true).
            Select(
            i => new ImageData
            {
                Id = i.Id,
                ImageName = i.Filename,
                ImageSrc = string.Format("{0}://{1}/Image/{2}/Gallery/{3}", scheme, host, articleId.ToString(), i.Filename)
            }).
            ToListAsync(cancellationToken);
    }

    public async Task<ImageData> GetAuthorImage(
        int authorId,
        string scheme,
        string host)
    {
        await using var db = _databaseFactory();

        if (!db.Authors.Any(a => a.Id == authorId))
        {
            throw new ArgumentNullException(nameof(authorId));
        }

        return new ImageData
        {
            Id = authorId,
            ImageName = string.Format("{0}.webp", authorId.ToString()),
            ImageSrc = string.Format("{0}://{1}/Image/Authors/{2}.webp",
                scheme,
                host,
                authorId.ToString()
            )
        };
    }
}
