using FluentAssertions;
using Flurl.Http;
using LinqToDB;
using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Modules.Files.Models;
using System.Net;

namespace MarkAsPlayed.Api.Tests.Modules.Files;

public sealed class FilesGalleryUpdateFixture : IntegrationTest
{
    public readonly int testId = 1;
    protected override async Task SetUp()
    {
        await using var db = CreateDatabase();

        await db.Articles.InsertAsync(
            () => new Data.Models.Article
            {
                Id = 1,
                ArticleTypeId = 1,
                CreatedAt = new DateTimeOffset(new DateTime(2022, 09, 19)),
                CreatedBy = 1,
                LongDescription = "Review Long Description string",
                PlayedOnGamingPlatformId = 1,
                PlayTime = 15,
                Producer = "Review Producer string",
                ShortDescription = "Review Short Description string",
                Title = "Review Title string"
            }
        );

        await db.ArticleImages.InsertAsync(
            () => new Data.Models.ArticleImage
            {
                Id = 1,
                ArticleId = 1,
                FileName = "a0efbcc8-0d59-4c88-8322-9f031cf5bbde.webp",
                IsActive = true
            }
        );

        await db.ArticleImages.InsertAsync(
            () => new Data.Models.ArticleImage
            {
                Id = 2,
                ArticleId = 1,
                FileName = "014091ba-afbd-4213-af63-bfb63d64957a.webp",
                IsActive = true
            }
        );

        await db.ArticleImages.InsertAsync(
            () => new Data.Models.ArticleImage
            {
                Id = 3,
                ArticleId = 1,
                FileName = "658c4ad9-7c79-4458-8049-94e8d4159bf0.webp",
                IsActive = true
            }
        );

        await db.ArticleImages.InsertAsync(
            () => new Data.Models.ArticleImage
            {
                Id = 4,
                ArticleId = 1,
                FileName = "ba080168-16f9-4c26-b9f4-fc0d6e1ac2cb.webp",
                IsActive = false
            }
        );
    }
}

public class FilesGalleryUpdateEndpointTests : IClassFixture<FilesGalleryUpdateFixture>
{
    private readonly FilesGalleryUpdateFixture _suite;

    public FilesGalleryUpdateEndpointTests(FilesGalleryUpdateFixture suite)
    {
        _suite = suite;
    }

    [Fact]
    public async Task ShouldFailValidationWithMalformedRequest()
    {
        var response = await _suite.Client.AllowHttpStatus(HttpStatusCode.BadRequest).
                Request("files", "article", _suite.testId, "gallery").
                PutJsonAsync(new { Id = "" });

        response.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ShouldRetrieveNotFoundOnNotExistingImage()
    {
        var response = await _suite.Client.AllowHttpStatus(HttpStatusCode.NotFound).
                Request("files", "article", _suite.testId, "gallery").
                PutJsonAsync(new GalleryUpdateRequest 
                {
                    Id = 5
                });

        response.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ShouldUpdateGallery()
    {
        var testingId = 2;

        var response = await _suite.Client.Request("files", "article", "1", "gallery").
                PutJsonAsync(new GalleryUpdateRequest
                {
                    Id = 2
                });

        var data = await response.GetJsonAsync<int>();
        data.Should().Be(1);

        await using var db = _suite.CreateDatabase();

        var item = await db.ArticleImages.FirstOrDefaultAsync(image => image.Id == testingId);

        item.Should().BeEquivalentTo(
            new ArticleImage
            {
                ArticleId = 1,
                IsActive = false
            },
            options => options.Excluding(o => o.Id).Excluding(o => o.FileName)
        );
    }
}
