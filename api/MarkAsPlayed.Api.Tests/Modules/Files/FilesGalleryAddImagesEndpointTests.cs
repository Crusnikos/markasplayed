using FluentAssertions;
using Flurl.Http;
using LinqToDB;
using System.Net;

namespace MarkAsPlayed.Api.Tests.Modules.Files;

public sealed class FilesGalleryAddImagesFixture : IntegrationTest
{
    public readonly int testId = 2;

    protected override async Task SetUp()
    {
        await using var db = CreateDatabase();

        await db.Articles.InsertAsync(
            () => new Data.Models.Article
            {
                Id = testId,
                ArticleTypeId = 3,
                CreatedAt = new DateTimeOffset(new DateTime(2022, 1, 17)),
                CreatedBy = 1,
                LongDescription = "Other Long Description string",
                PlayedOnGamingPlatformId = null,
                PlayTime = null,
                Producer = null,
                ShortDescription = "Other Short Description string",
                Title = "Other Title string"
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
        await _suite.DisposeTestFilesAsync(new string[] { _suite.testId.ToString() });
    }

    public Task InitializeAsync()
    {
        return Task.CompletedTask;
    }

    [Fact]
    public async Task ShouldFailValidationWithMalformedRequest()
    {
        var response = await _suite.Client.AllowHttpStatus(HttpStatusCode.BadRequest).
            Request("files", "article", _suite.testId.ToString(), "gallery").
            PostMultipartAsync(mp => { });
        response.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ShouldReturn409DuringAProcessThatWasPartiallySuccessful()
    {
        var response = await _suite.Client.AllowHttpStatus(HttpStatusCode.Conflict).
            Request("files", "article", _suite.testId.ToString(), "gallery").
            PostMultipartAsync(mp =>
            {
                mp.AddFile("files", "/app/MarkAsPlayed.Api.Tests/TestImages/test1png.png");
                mp.AddFile("files", "/app/MarkAsPlayed.Api.Tests/TestImages/test1webp.webp");
            });
        response.StatusCode.Should().Be((int)HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task ShouldSaveGalleryImages()
    {
        var response = await _suite.Client.Request("files", "article", _suite.testId.ToString(), "gallery").
            PostMultipartAsync(mp =>
            {
                mp.AddFile("files", "/app/MarkAsPlayed.Api.Tests/TestImages/test1webp.webp");
                mp.AddFile("files", "/app/MarkAsPlayed.Api.Tests/TestImages/test2webp.webp");
            });

        response.StatusCode.Should().Be((int)HttpStatusCode.NoContent);

        await using var db = _suite.CreateDatabase();

        var items = await db.ArticleImages.Where(image => image.ArticleId == _suite.testId).ToListAsync();

        items.Should().HaveCountGreaterThan(1);
    }
}
