using LinqToDB;
using MarkAsPlayed.Api.Data;

namespace MarkAsPlayed.Api.Modules.Files.Commands;

public sealed class FilesCommand
{
    private readonly Database.Factory _databaseFactory;
    private const string DefaultFrontImageFileName = "Main.webp";
    private const string DefaultSmallFrontImageFileName = "MainSmall.webp";

    (string Name, Resolution Resolution)[] ResolutionsMatchedWithNames = { 
        (DefaultFrontImageFileName, ImageResolution.ResolutionHD), 
        (DefaultSmallFrontImageFileName, ImageResolution.ResolutionNHD) 
    };

    public FilesCommand(Database.Factory databaseFactory)
    {
        _databaseFactory = databaseFactory;
    }

    public async Task UpdateFrontImageAsync(IFormFile file, string filePathName, CancellationToken cancellationToken = default)
    {
        if (file.Length > 0 && Path.GetExtension(file.FileName) == ".webp")
        {
            if(!Directory.Exists(filePathName))
            {
                Directory.CreateDirectory(filePathName);
            }

            foreach (var item in ResolutionsMatchedWithNames)
            {
                using (var stream = File.Create(Path.Combine(filePathName, item.Name)))
                {
                    await file.CopyToAsync(stream, cancellationToken);
                }

                await new ImageResolution(
                    Path.Combine(filePathName, item.Name)).
                    OverwriteFileResolution(item.Resolution, cancellationToken);
            }

        }
    }

    public async Task UpdateGalleryAsync(
        IReadOnlyList<int> updateIds,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();

        await using var transaction = await db.BeginTransactionAsync(cancellationToken);

        var images = db.ArticleImages.Where(ag => updateIds.Contains((int)ag.Id)).ToListAsync(cancellationToken);

        foreach (var image in images.Result)
        {
            await db.ArticleImages.Where(ag => ag.Id == image.Id).
                Set(ag => ag.IsActive, false).
                UpdateAsync(cancellationToken);
        }

        await transaction.CommitAsync(cancellationToken);
    }

    public async Task<bool?> AddToGalleryAsync(
        IReadOnlyList<IFormFile> files,
        string filePathName,
        int articleId,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();
        await using var transaction = await db.BeginTransactionAsync(cancellationToken);
        var successfulFilesUploadSum = files.Count;

        if (!Directory.Exists(filePathName))
        {
            Directory.CreateDirectory(filePathName);
        }

        foreach (var file in files.Where(
            file => file.Length > 0 && 
            Path.GetExtension(file.FileName) == ".webp")
            )
        {
            var fileName = Guid.NewGuid().ToString() + ".webp";

            try
            {
                using (var stream = File.Create(Path.Combine(filePathName, fileName)))
                {
                    await file.CopyToAsync(stream, cancellationToken);
                }

                await new ImageResolution(
                    Path.Combine(filePathName, fileName)).
                    OverwriteFileResolution(ImageResolution.ResolutionFullHD, cancellationToken);

                await db.ArticleImages.InsertWithInt64IdentityAsync(
                    () => new Data.Models.ArticleImage
                    {
                        ArticleId = articleId,
                        FileName = fileName,
                        IsActive = true
                    },
                    cancellationToken
                );
            }
            catch (Exception)
            {
                if(File.Exists(Path.Combine(filePathName, fileName)) is true)
                {
                    File.Delete(Path.Combine(filePathName, fileName));
                }

                successfulFilesUploadSum--;
            }
        }

        await transaction.CommitAsync(cancellationToken);

        if(successfulFilesUploadSum == files.Count)
        {
            return true;
        }
        if(successfulFilesUploadSum == 0)
        {
            return null;
        }

        return false;
    }
}
