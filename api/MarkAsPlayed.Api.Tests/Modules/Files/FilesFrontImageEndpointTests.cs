using FluentAssertions;
using Flurl.Http;
using LinqToDB;
using MarkAsPlayed.Api.Modules.Files.Models;
using System.Net;

namespace MarkAsPlayed.Api.Tests.Modules.Files;

public sealed class FilesFrontImageFixture : IntegrationTest
{
    protected override async Task SetUp()
    {
        await using var db = CreateDatabase();

        await db.Articles.InsertAsync(
            () => new Data.Models.Article
            {
                Id = 1,
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

public class FilesFrontImageEndpointTests : IClassFixture<FilesFrontImageFixture>
{
    private readonly FilesFrontImageFixture _suite;

    public FilesFrontImageEndpointTests(FilesFrontImageFixture suite)
    {
        _suite = suite;
    }

    [Fact]
    public async Task ShouldRetrieveNotFoundOnNotExistingArticle()
    {
        var response = await _suite.Client.AllowHttpStatus(HttpStatusCode.NotFound).
                                    Request("files", "article", "2", "front").
                                    GetAsync();

        response.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ShouldRetrieveSmallFrontImageUrl()
    {
        var response = await _suite.Client.Request("files", "article", "1", "front").
                                    SetQueryParam("size", "small").
                                    GetJsonAsync<ImageData>();

        response.Should().BeEquivalentTo(new ImageData
        {
            Id = 1,
            ImageFileName = "Main.webp",
            ImagePathName = "http://localhost/Image/1/MainSmall.webp"
        });
    }

    [Fact]
    public async Task ShouldRetrieveLargeFrontImageUrl()
    {
        var response = await _suite.Client.Request("files", "article", "1", "front").
                                    SetQueryParam("size", "large").
                                    GetJsonAsync<ImageData>();

        response.Should().BeEquivalentTo(new ImageData
        {
            Id = 1,
            ImageFileName = "Main.webp",
            ImagePathName = "http://localhost/Image/1/Main.webp"
        });
    }
}
