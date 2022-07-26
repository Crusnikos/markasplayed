using LinqToDB;
using MarkAsPlayed.Api.Data;

namespace MarkAsPlayed.Api.Modules.Image.Commands;

public sealed class ImageCommand
{
    private readonly Database.Factory _databaseFactory;
    private const string DefaultFrontImageName = "Main.webp";
    private const string DefaultSmallFrontImageName = "MainSmall.webp";

    public ImageCommand(Database.Factory databaseFactory)
    {
        _databaseFactory = databaseFactory;
    }

    public async Task UpdateFrontImage(IFormFile file, string filePath, CancellationToken cancellationToken = default)
    {
        if (file.Length > 0 && Path.GetExtension(file.FileName) == ".webp")
        {
            if(!Directory.Exists(filePath))
            {
                Directory.CreateDirectory(filePath);
            }

            using (var stream = File.Create(Path.Combine(filePath, DefaultFrontImageName)))
            {
                await file.CopyToAsync(stream, cancellationToken);
            }

            await new ImageResolution(
                Path.Combine(filePath, DefaultFrontImageName)).
                ConfigureFileResolution(ImageResolution.ResolutionHD, cancellationToken);

            using (var stream = File.Create(Path.Combine(filePath, DefaultSmallFrontImageName)))
            {
                await file.CopyToAsync(stream, cancellationToken);
            }

            await new ImageResolution(
                Path.Combine(filePath, DefaultSmallFrontImageName)).
                ConfigureFileResolution(ImageResolution.ResolutionNHD, cancellationToken);

        }
    }

    public async Task UpdateExistingGalleryImages(
        IReadOnlyList<int> updateIds,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();

        await using var transaction = await db.BeginTransactionAsync(cancellationToken);

        var images = db.ArticleGallery.Where(ag => updateIds.Contains((int)ag.Id)).ToListAsync(cancellationToken);

        foreach (var image in images.Result)
        {
            await db.ArticleGallery.Where(ag => ag.Id == image.Id).
                Set(ag => ag.IsActive, false).
                UpdateAsync(cancellationToken);
        }

        await transaction.CommitAsync(cancellationToken);
    }

    public async Task AddNewGalleryImages(
        IReadOnlyList<IFormFile> files,
        string filePath,
        int articleId,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();
        await using var transaction = await db.BeginTransactionAsync(cancellationToken);

        if (!Directory.Exists(filePath))
        {
            Directory.CreateDirectory(filePath);
        }

        foreach (var file in files.Where(file => file.Length > 0))
        {
            if(Path.GetExtension(file.FileName) != ".webp")
            {
                continue;
            }

            var fileName = Guid.NewGuid().ToString() + ".webp";

            using (var stream = File.Create(Path.Combine(filePath, fileName)))
            {
                await file.CopyToAsync(stream, cancellationToken);
            }

            await new ImageResolution(
                Path.Combine(filePath, fileName)).
                ConfigureFileResolution(ImageResolution.ResolutionFullHD, cancellationToken);

            await db.ArticleGallery.InsertWithInt64IdentityAsync(
                () => new Data.Models.ArticleGallery
                {
                    ArticleId = articleId,
                    Filename = fileName,
                    IsActive = true
                },
                cancellationToken
            );
        }

        await transaction.CommitAsync(cancellationToken);
    }
}
