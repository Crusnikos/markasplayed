﻿using LinqToDB;
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
        IReadOnlyList<int> updateIds,
        int articleId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await using var db = _databaseFactory();
            await using var transaction = await db.BeginTransactionAsync(cancellationToken);

            var images = await db.ArticleImages.Where(image => updateIds.Contains((int)image.Id)).ToListAsync(cancellationToken);

            if (images.Count < 1)
            {
                return new CommonResponseTemplate
                {
                    ArticleIdentifier = articleId,
                    Status = StatusCodesHelper.NotFound,
                    ExceptionCaptured = null,
                    Message = "No images found"
                };
            }

            foreach (var image in images)
            {
                await db.ArticleImages.Where(ag => ag.Id == image.Id).
                    Set(ag => ag.IsActive, false).
                    UpdateAsync(cancellationToken);
            }

            await transaction.CommitAsync(cancellationToken);

            return new CommonResponseTemplate
            {
                ArticleIdentifier = articleId,
                Status = StatusCodesHelper.OK,
                ExceptionCaptured = null,
                Message = "Gallery updated"
            };
        }
        catch (Exception exception)
        {
            return new CommonResponseTemplate
            {
                ArticleIdentifier = articleId,
                Status = StatusCodesHelper.InternalError,
                ExceptionCaptured = exception,
                Message = "Failed to update gallery"
            };
        }
    }

    public async Task<CommonResponseTemplate> AddToGalleryAsync(
        IReadOnlyList<IFormFile> files,
        string pathName,
        int articleId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await using var db = _databaseFactory();
            await using var transaction = await db.BeginTransactionAsync(cancellationToken);
            var successfulFilesUploadSum = files.Count;

            if (!Directory.Exists(pathName))
            {
                Directory.CreateDirectory(pathName);
            }

            foreach (var file in files)
            {
                var fileName = string.Empty;
                var fileFullPath = string.Empty;

                try
                {
                    if (file.Length == 0 || Path.GetExtension(file.FileName) != ".webp")
                    throw new Exception("Incorrect or missing file provided");

                    fileName = Guid.NewGuid().ToString() + ".webp";
                    fileFullPath = Path.Combine(pathName, fileName);
                
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
                catch (Exception)
                {
                    if (String.IsNullOrEmpty(fileFullPath) is false && File.Exists(fileFullPath) is true)
                    {
                        Console.WriteLine("test");
                        File.Delete(fileFullPath);
                    }
                    successfulFilesUploadSum--;
                }
            }

            await transaction.CommitAsync(cancellationToken);

            if (successfulFilesUploadSum == files.Count)
            {
                return new CommonResponseTemplate
                {
                    ArticleIdentifier = articleId,
                    Status = StatusCodesHelper.NoContent,
                    ExceptionCaptured = null,
                    Message = "All images uploaded to gallery"
                };
            }
            if (successfulFilesUploadSum == 0)
                throw new Exception("0 files uploaded");

            return new CommonResponseTemplate
            {
                ArticleIdentifier = articleId,
                Status = StatusCodesHelper.Conflict,
                ExceptionCaptured = null,
                Message = $"{successfulFilesUploadSum} from {files.Count} images uploaded"
            };
        }
        catch (Exception exception)
        {
            return new CommonResponseTemplate
            {
                ArticleIdentifier = articleId,
                Status = StatusCodesHelper.InternalError,
                ExceptionCaptured = exception,
                Message = "Failed add images to gallery"
            };
        }
    }
}
