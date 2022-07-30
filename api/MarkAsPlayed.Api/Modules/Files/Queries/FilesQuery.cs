using LinqToDB;
using MarkAsPlayed.Api.Data;
using MarkAsPlayed.Api.Modules.Files.Models;

namespace MarkAsPlayed.Api.Modules.Files.Queries;

public sealed class FilesQuery
{
    private readonly Database.Factory _databaseFactory;
    private const int DefaultPageSize = 5;
    private const string DefaultFrontImageFileName = "Main.webp";
    private const string DefaultSmallFrontImageFileName = "MainSmall.webp";

    public FilesQuery(Database.Factory databaseFactory)
    {
        _databaseFactory = databaseFactory;
    }

    public async Task<ImageData?> GetFrontImageAsync(
        int articleId,
        Uri baseUri,
        bool small)
    {
        await using var db = _databaseFactory();

        if (!db.Articles.Any(a => a.Id == articleId))
        {
            return null;
        }

        var imageSize = small ? DefaultSmallFrontImageFileName : DefaultFrontImageFileName;

        return new ImageData
        {
            Id = articleId,
            ImageFileName = DefaultFrontImageFileName,
            ImagePathName = new Uri(baseUri, $"/Image/{articleId}/{imageSize}").AbsoluteUri
        };
    }

    public async Task<IEnumerable<ImageData>> GetSliderAsync(
        Uri baseUri,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();

        return await db.Articles.Select(
            q => new ImageData
            {
                Id = q.Id,
                ImageFileName = DefaultFrontImageFileName,
                ImagePathName = new Uri(baseUri, $"/Image/{q.Id}/{DefaultFrontImageFileName}").AbsoluteUri
            }).
            OrderByDescending(q => q.Id).
            Take(DefaultPageSize).
            ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<ImageData>> GetGalleryAsync(
        int articleId,
        Uri baseUri,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();

        if (!db.Articles.Any(a => a.Id == articleId))
        {
            return Enumerable.Empty<ImageData>();
        }

        return await db.ArticleImages.
            Where(ag => ag.ArticleId == articleId).
            Where(ag => ag.IsActive == true).
            Select(
            i => new ImageData
            {
                Id = i.Id,
                ImageFileName = i.FileName,
                ImagePathName = new Uri(baseUri, $"/Image/{articleId}/Gallery/{i.FileName}").AbsoluteUri
            }).
            ToListAsync(cancellationToken);
    }

    public async Task<ImageData> GetAuthorImageAsync(
        int authorId,
        Uri baseUri)
    {
        await using var db = _databaseFactory();

        if (!db.Authors.Any(a => a.Id == authorId))
        {
            throw new ArgumentNullException(nameof(authorId));
        }

        return new ImageData
        {
            Id = authorId,
            ImageFileName = string.Format("{0}.webp", authorId.ToString()),
            ImagePathName = new Uri(baseUri, $"/Image/Authors/{authorId}.webp").AbsoluteUri
        };
    }
}
