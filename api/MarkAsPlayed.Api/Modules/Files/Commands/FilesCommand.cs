using LinqToDB;
using MarkAsPlayed.Api.Data;

namespace MarkAsPlayed.Api.Modules.Files.Commands;

public sealed class FilesCommand
{
    private readonly Database.Factory _databaseFactory;
    private const string DefaultFrontImageFileName = "Main.webp";
    private const string DefaultSmallFrontImageFileName = "MainSmall.webp";

    (string Name, Resolution Resolution)[] ResolutionsMatchedWithNames = { 
        (DefaultFrontImageFileName, Resolution.HD), 
        (DefaultSmallFrontImageFileName, Resolution.NHD) 
    };

    public FilesCommand(Database.Factory databaseFactory)
    {
        _databaseFactory = databaseFactory;
    }

    public async Task UpdateFrontImageAsync(IFormFile file, string filePathName, CancellationToken cancellationToken = default)
    {
        if (file.Length == 0 || Path.GetExtension(file.FileName) != ".webp")
        {
            return;
        }

        if (!Directory.Exists(filePathName))
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

    public async Task UpdateGalleryAsync(
        IReadOnlyList<int> updateIds,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();

        await using var transaction = await db.BeginTransactionAsync(cancellationToken);

        var images = await db.ArticleImages.Where(ag => updateIds.Contains((int)ag.Id)).ToListAsync(cancellationToken);

        foreach (var image in images)
        {
            await db.ArticleImages.Where(ag => ag.Id == image.Id).
                Set(ag => ag.IsActive, false).
                UpdateAsync(cancellationToken);
        }

        await transaction.CommitAsync(cancellationToken);
    }

    public async Task<bool?> AddToGalleryAsync(
        IReadOnlyList<IFormFile> files,
        string pathName,
        int articleId,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();
        await using var transaction = await db.BeginTransactionAsync(cancellationToken);
        var successfulFilesUploadSum = files.Count;

        if (!Directory.Exists(pathName))
        {
            Directory.CreateDirectory(pathName);
        }

        foreach (var file in files.Where(
            file => file.Length > 0 && 
            Path.GetExtension(file.FileName) == ".webp")
            )
        {
            var fileName = Guid.NewGuid().ToString() + ".webp";
            var fileFullPath = Path.Combine(pathName, fileName);

            try
            {
                using (var stream = File.Create(fileFullPath))
                {
                    await file.CopyToAsync(stream, cancellationToken);
                }

                await new ImageResolution(fileFullPath).
                    OverwriteFileResolution(Resolution.FullHD, cancellationToken);

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
            catch (Exception exception)
            {
                Console.WriteLine($"File {file.FileName} failed on upload");
                Console.WriteLine($"Exception: {exception.Message}");

                if (File.Exists(fileFullPath) is true)
                {
                    File.Delete(fileFullPath);
                }

                Console.WriteLine($"File {file.FileName} successfully removed");

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
