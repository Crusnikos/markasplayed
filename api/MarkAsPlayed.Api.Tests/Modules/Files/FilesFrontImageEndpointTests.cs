using FluentAssertions;
using Flurl.Http;
using LinqToDB;
using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Modules;
using MarkAsPlayed.Api.Modules.Files.Models;
using System.Net;

namespace MarkAsPlayed.Api.Tests.Modules.Files;

public sealed class FilesFrontImageFixture : IntegrationTest
{
    public long OtherArticleId = 0;

    protected override async Task SetUp()
    {
        await using var db = CreateDatabase();
        var testData = new GeneralDatabaseTestData();

        var otherId = await db.InsertWithInt64IdentityAsync(testData.OtherArticleExample, db.GetTable<Data.Models.Article>().TableName);
        await db.InsertAsync(testData.CreateArticleContentData(ArticleTypeHelper.other, otherId), db.GetTable<ArticleContent>().TableName);

        OtherArticleId = otherId;
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
        var response = await _suite.Client.Request("files", "article", _suite.OtherArticleId, "front").
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
        var response = await _suite.Client.Request("files", "article", _suite.OtherArticleId, "front").
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
