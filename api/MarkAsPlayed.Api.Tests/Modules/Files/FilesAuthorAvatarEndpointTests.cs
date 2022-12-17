using FluentAssertions;
using Flurl.Http;
using LinqToDB;
using MarkAsPlayed.Api.Modules.Files.Models;
using System.Net;

namespace MarkAsPlayed.Api.Tests.Modules.Files;

public sealed class FilesAuthorAvatarFixture : IntegrationTest
{
    protected override async Task SetUp()
    {
        await using var db = CreateDatabase();
    }
}

public class FilesAuthorAvatarEndpointTests : IClassFixture<FilesAuthorAvatarFixture>
{
    private readonly FilesAuthorAvatarFixture _suite;

    public FilesAuthorAvatarEndpointTests(FilesAuthorAvatarFixture suite)
    {
        _suite = suite;
    }

    [Fact]
    public async Task ShouldRetrieveNotFoundOnNotExistingArticle()
    {
        var response = await _suite.Client.AllowHttpStatus(HttpStatusCode.NotFound).
                                    Request("files", "author", "2", "avatar").
                                    GetAsync();

        response.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ShouldRetrieveAuthorAvatarData()
    {
        var response = await _suite.Client.Request("files", "author", "1", "avatar").
                                    GetJsonAsync<ImageData>();

        response.Should().BeEquivalentTo(new ImageData
        {
            Id = 1,
            ImageFileName = "1.webp",
            ImagePathName = "http://localhost/Image/Authors/1.webp"
        });
    }
}
