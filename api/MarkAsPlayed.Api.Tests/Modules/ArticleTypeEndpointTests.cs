using Flurl.Http;
using FluentAssertions;
using MarkAsPlayed.Api.Lookups;

namespace MarkAsPlayed.Api.Tests.Modules;

public sealed class ArticleTypeEndpointTests : IntegrationTest
{
    [Fact]
    public async Task ShouldRetrieveLookupDataTable()
    {
        var response = await Client.Request("articleTypes").
                                    GetJsonAsync<List<LookupData>>();
        response.Should().Contain(v => v.Name == "review" && v.GroupName == 'A');
        response.Should().Contain(v => v.Name == "news" && v.GroupName == 'A');
        response.Should().Contain(v => v.Name == "other" && v.GroupName == 'A');
        response.Should().HaveCount(3);
    }
}
