using FluentAssertions;
using Flurl.Http;
using LinqToDB;
using System.Net;

namespace MarkAsPlayed.Api.Tests.Modules.Files;

public sealed class FilesGalleryAddImagesFixture : IntegrationTest
{
    public long OtherArticleId = 2;

    protected override async Task SetUp()
    {
        await using var db = CreateDatabase();

        await db.Articles.InsertAsync(
            () => new Data.Models.Article
            {
                Id = OtherArticleId,
                ArticleTypeId = 3,
                CreatedAt = new DateTimeOffset(new DateTime(2022, 1, 17)),
                CreatedBy = 1,
                ShortDescription = "Other Short Description string",
                Title = "Other Title string"
            }
        );

        await db.ArticlesContent.InsertAsync(
            () => new Data.Models.ArticleContent
            {
                ArticleId = OtherArticleId,
                LongDescription = "Other Long Description string"
            }
        );
    }
}

public class FilesGalleryAddImagesEndpointTests : IClassFixture<FilesGalleryAddImagesFixture>, IAsyncLifetime
{
    private readonly FilesGalleryAddImagesFixture _suite;

    public FilesGalleryAddImagesEndpointTests(FilesGalleryAddImagesFixture suite)
    {
        _suite = suite;
    }

    public async Task DisposeAsync()
    {
        await _suite.DisposeTestFilesAsync(new string[] { _suite.OtherArticleId.ToString() });
    }

    public Task InitializeAsync()
    {
        return Task.CompletedTask;
    }

    [Fact]
    public async Task ShouldFailValidationWithMalformedRequest()
    {
        var response = await _suite.Client.AllowHttpStatus(HttpStatusCode.BadRequest).
            Request("files", "article", _suite.OtherArticleId, "gallery").
            PostMultipartAsync(mp => { });
        response.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ShouldSaveGalleryImage()
    {
        var articleID = _suite.OtherArticleId;

        var response = await _suite.Client.Request("files", "article", articleID, "gallery").
            PostMultipartAsync(mp =>
            {
                mp.AddFile("file", "/app/MarkAsPlayed.Api.Tests/TestImages/test1webp.webp");
            });

        response.StatusCode.Should().Be((int)HttpStatusCode.NoContent);

        await using var db = _suite.CreateDatabase();

        var items = await db.ArticleImages.Where(image => image.ArticleId == articleID).ToListAsync();

        items.Should().HaveCount(1);
    }
}
