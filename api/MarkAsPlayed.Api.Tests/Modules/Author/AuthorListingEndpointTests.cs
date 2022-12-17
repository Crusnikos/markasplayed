using FluentAssertions;
using Flurl.Http;
using LinqToDB;
using MarkAsPlayed.Api.Modules.Author.Models;

namespace MarkAsPlayed.Api.Tests.Modules.Author;

public sealed  class AuthorListingEndpointTests : IClassFixture<IntegrationTest>, IAsyncLifetime
{
    private readonly IntegrationTest _suite;

    public AuthorListingEndpointTests(IntegrationTest suite)
    {
        _suite = suite;
    }

    public async Task InitializeAsync()
    {
        await using var db = _suite.CreateDatabase();
    }

    public async Task DisposeAsync()
    {
        await using var db = _suite.CreateDatabase();
        await db.Articles.DeleteAsync();
        await db.ArticleGamingPlatforms.DeleteAsync();
    }

    [Fact]
    public async Task ShouldRetrieveAuthorsListing()
    {
        var response = await _suite.Client.Request("author", "listing").
                                    GetAsync();

        var jsonSerializedResponse = await response.GetJsonAsync<IEnumerable<AuthorData>>();

        jsonSerializedResponse.Should().HaveCount(1);
    }
}
