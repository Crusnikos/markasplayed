using LinqToDB;
using MarkAsPlayed.Api.Data;
using MarkAsPlayed.Api.Modules.Files.Models;
using System;

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

    public async Task<CommonResponseTemplate> CreateFrontImageAsync(IFormFile file, string filePathName, CancellationToken cancellationToken = default)
    {
        try
        {
            if (file.Length == 0 || Path.GetExtension(file.FileName) != ".webp")
            {
                return new CommonResponseTemplate
                {
                    ArticleIdentifier = null,
                    Status = StatusCodesHelper.BadRequest,
                    ExceptionCaptured = null,
                    Message = "Incorrect or missing file provided"
                };
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

            return new CommonResponseTemplate
            {
                ArticleIdentifier = null,
                Status = StatusCodesHelper.NoContent,
                ExceptionCaptured = null,
                Message = "Front image updated"
            };
        }
        catch (Exception exception)
        {
            return new CommonResponseTemplate
            {
                ArticleIdentifier = null,
                Status = StatusCodesHelper.InternalError,
                ExceptionCaptured = exception,
                Message = "Failed to update front image"
            };
        }
    }

    public async Task<CommonResponseTemplate> UpdateGalleryAsync(
        int imageId,
        int articleId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await using var db = _databaseFactory();
            await using var transaction = await db.BeginTransactionAsync(cancellationToken);

            var updateImage = await db.ArticleImages.FirstOrDefaultAsync(image => image.Id == imageId, cancellationToken);

            if (updateImage is null)
            {
                return new CommonResponseTemplate
                {
                    ArticleIdentifier = articleId,
                    Status = StatusCodesHelper.NotFound,
                    ExceptionCaptured = null,
                    Message = "No image found"
                };
            }

            await db.ArticleImages.Where(image => image.Id == updateImage.Id).
                    Set(ag => ag.IsActive, false).
                    UpdateAsync(cancellationToken);

            await transaction.CommitAsync(cancellationToken);

            return new CommonResponseTemplate
            {
                ArticleIdentifier = articleId,
                Status = StatusCodesHelper.OK,
                ExceptionCaptured = null,
                Message = "Gallery image updated"
            };
        }
        catch (Exception exception)
        {
            return new CommonResponseTemplate
            {
                ArticleIdentifier = articleId,
                Status = StatusCodesHelper.InternalError,
                ExceptionCaptured = exception,
                Message = "Failed to update gallery image"
            };
        }
    }

    public async Task<CommonResponseTemplate> AddToGalleryAsync(
        IFormFile file,
        string pathName,
        int articleId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await using var db = _databaseFactory();
            await using var transaction = await db.BeginTransactionAsync(cancellationToken);

            if (!Directory.Exists(pathName))
            {
                Directory.CreateDirectory(pathName);
            }

            var fileName = Guid.NewGuid().ToString() + ".webp";
            var fileFullPath = Path.Combine(pathName, fileName);

            try
            {
                if (file.Length == 0 || Path.GetExtension(file.FileName) != ".webp")
                    throw new Exception("Incorrect or missing file provided");
                

                using (var stream = File.Create(fileFullPath))
                {
                    await file.CopyToAsync(stream, cancellationToken);
                }

                await new ImageResolution(fileFullPath).
                    OverwriteFileResolution(Resolution.FullHD, cancellationToken);

                await db.ArticleImages.InsertAsync(
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
                if (!string.IsNullOrEmpty(fileFullPath) && File.Exists(fileFullPath))
                {
                    File.Delete(fileFullPath);
                    throw;
                }
            }

            await transaction.CommitAsync(cancellationToken);

            return new CommonResponseTemplate
            {
                ArticleIdentifier = articleId,
                Status = StatusCodesHelper.NoContent,
                ExceptionCaptured = null,
                Message = "Image uploaded to gallery"
            };
        }
        catch (Exception exception)
        {
            return new CommonResponseTemplate
            {
                ArticleIdentifier = articleId,
                Status = StatusCodesHelper.InternalError,
                ExceptionCaptured = exception,
                Message = "Failed add image to gallery"
            };
        }
    }
}
