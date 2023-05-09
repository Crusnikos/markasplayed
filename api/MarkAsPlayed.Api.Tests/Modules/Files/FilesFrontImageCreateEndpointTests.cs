using FluentAssertions;
using Flurl.Http;
using LinqToDB;
using System.Net;

namespace MarkAsPlayed.Api.Tests.Modules.Files;

public sealed class FilesFrontImageCreateFixture : IntegrationTest
{
    public long OtherArticleId = 1;

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

public class FilesFrontImageCreateEndpointTests : IClassFixture<FilesFrontImageCreateFixture>, IAsyncLifetime
{
    private readonly FilesFrontImageCreateFixture _suite;

    public FilesFrontImageCreateEndpointTests(FilesFrontImageCreateFixture suite)
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
            Request("files", "article", _suite.OtherArticleId, "front").
            PostMultipartAsync(mp => { });
        response.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ShouldReturn404WithNotAcceptedFileExtension()
    {
        var response = await _suite.Client.AllowHttpStatus(HttpStatusCode.BadRequest).
            Request("files", "article", _suite.OtherArticleId, "front").
            PostMultipartAsync(mp =>
            {
                mp.AddFile("file", "/app/MarkAsPlayed.Api.Tests/TestImages/test1png.png");
            });
        response.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ShouldSaveFrontImage()
    {
        var response = await _suite.Client.Request("files", "article", _suite.OtherArticleId, "front").
            PostMultipartAsync(mp =>
            {
                mp.AddFile("file", "/app/MarkAsPlayed.Api.Tests/TestImages/test2webp.webp");
            });

        response.StatusCode.Should().Be((int)HttpStatusCode.NoContent);
    }
}
