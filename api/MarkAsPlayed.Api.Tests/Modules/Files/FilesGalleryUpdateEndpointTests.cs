using FluentAssertions;
using Flurl.Http;
using LinqToDB;
using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Modules;
using MarkAsPlayed.Api.Modules.Files.Models;
using System.Net;

namespace MarkAsPlayed.Api.Tests.Modules.Files;

public sealed class FilesGalleryUpdateFixture : IntegrationTest
{
    public long ReviewArticleId = 0;
    protected override async Task SetUp()
    {
        await using var db = CreateDatabase();
        var testData = new GeneralDatabaseTestData();

        var reviewId = await db.InsertWithInt64IdentityAsync(testData.ReviewArticleExample, db.GetTable<Data.Models.Article>().TableName);
        await db.InsertAsync(testData.CreateArticleReviewData(reviewId), db.GetTable<ArticleReviewData>().TableName);
        await db.InsertAsync(testData.CreateArticleContentData(ArticleTypeHelper.review, reviewId), db.GetTable<ArticleContent>().TableName);

        await db.ArticleImages.InsertAsync(
            () => new ArticleImage
            {
                Id = 1,
                ArticleId = 1,
                FileName = "a0efbcc8-0d59-4c88-8322-9f031cf5bbde.webp",
                IsActive = true
            }
        );

        await db.ArticleImages.InsertAsync(
            () => new ArticleImage
            {
                Id = 2,
                ArticleId = 1,
                FileName = "014091ba-afbd-4213-af63-bfb63d64957a.webp",
                IsActive = true
            }
        );

        await db.ArticleImages.InsertAsync(
            () => new ArticleImage
            {
                Id = 3,
                ArticleId = 1,
                FileName = "658c4ad9-7c79-4458-8049-94e8d4159bf0.webp",
                IsActive = true
            }
        );

        await db.ArticleImages.InsertAsync(
            () => new ArticleImage
            {
                Id = 4,
                ArticleId = 1,
                FileName = "ba080168-16f9-4c26-b9f4-fc0d6e1ac2cb.webp",
                IsActive = false
            }
        );

        ReviewArticleId = reviewId;
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
                Request("files", "article", _suite.ReviewArticleId, "gallery").
                PutJsonAsync(new { Id = "" });

        response.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ShouldRetrieveNotFoundOnNotExistingImage()
    {
        var response = await _suite.Client.AllowHttpStatus(HttpStatusCode.NotFound).
                Request("files", "article", _suite.ReviewArticleId, "gallery").
                PutJsonAsync(new GalleryUpdateRequest 
                {
                    Id = 5
                });

        response.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ShouldUpdateGallery()
    {
        var articleId = _suite.ReviewArticleId;
        var imageId = 2;

        var response = await _suite.Client.Request("files", "article", articleId, "gallery").
                PutJsonAsync(new GalleryUpdateRequest
                {
                    Id = imageId
                });

        var data = await response.GetJsonAsync<int>();
        data.Should().Be(1);

        await using var db = _suite.CreateDatabase();

        var item = await db.ArticleImages.FirstOrDefaultAsync(image => image.Id == imageId && image.ArticleId == articleId);

        item.Should().BeEquivalentTo(
            new ArticleImage
            {
                ArticleId = articleId,
                IsActive = false
            },
            options => options.Excluding(o => o.Id).Excluding(o => o.FileName)
        );
    }
}
