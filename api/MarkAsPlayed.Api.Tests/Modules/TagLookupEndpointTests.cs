using FluentAssertions;
using Flurl.Http;
using MarkAsPlayed.Api.Lookups;

namespace MarkAsPlayed.Api.Tests.Modules;

public sealed class TagLookupEndpointTests : IntegrationTest
{
    [Fact]
    public async Task ShouldRetrieveLookupDataTable()
    {
        var response = await Client.Request("tagData").
                                    GetJsonAsync<List<LookupData>>();
        response.Should().Contain(v => v.Name == "boardGame" && v.GroupName == 'E');
        response.Should().Contain(v => v.Name == "event" && v.GroupName == 'E');
        response.Should().Contain(v => v.Name == "game" && v.GroupName == 'E');
        response.Should().Contain(v => v.Name == "movie" && v.GroupName == 'E');
        response.Should().Contain(v => v.Name == "series" && v.GroupName == 'E');
        response.Should().Contain(v => v.Name == "story" && v.GroupName == 'E');
        response.Should().Contain(v => v.Name == "action" && v.GroupName == 'T');
        response.Should().Contain(v => v.Name == "adventure" && v.GroupName == 'T');
        response.Should().Contain(v => v.Name == "puzzle" && v.GroupName == 'T');
        response.Should().Contain(v => v.Name == "rolePlaying" && v.GroupName == 'T');
        response.Should().Contain(v => v.Name == "simulation" && v.GroupName == 'T');
        response.Should().Contain(v => v.Name == "strategy" && v.GroupName == 'T');
        response.Should().Contain(v => v.Name == "sports" && v.GroupName == 'T');
        response.Should().Contain(v => v.Name == "sandbox" && v.GroupName == 'T');
        response.Should().Contain(v => v.Name == "shooter" && v.GroupName == 'T');
        response.Should().Contain(v => v.Name == "cardGame" && v.GroupName == 'T');
        response.Should().Contain(v => v.Name == "diceGame" && v.GroupName == 'T');
        response.Should().Contain(v => v.Name == "anime" && v.GroupName == 'G');
        response.Should().Contain(v => v.Name == "comedy" && v.GroupName == 'G');
        response.Should().Contain(v => v.Name == "fantasy" && v.GroupName == 'G');
        response.Should().Contain(v => v.Name == "horror" && v.GroupName == 'G');
        response.Should().Contain(v => v.Name == "scienceFiction" && v.GroupName == 'G');
        response.Should().Contain(v => v.Name == "thriller" && v.GroupName == 'G');
        response.Should().Contain(v => v.Name == "mystery" && v.GroupName == 'G');
        response.Should().Contain(v => v.Name == "romance" && v.GroupName == 'G');
        response.Should().Contain(v => v.Name == "western" && v.GroupName == 'G');
        response.Should().Contain(v => v.Name == "pegi3" && v.GroupName == 'P');
        response.Should().Contain(v => v.Name == "pegi7" && v.GroupName == 'P');
        response.Should().Contain(v => v.Name == "pegi12" && v.GroupName == 'P');
        response.Should().Contain(v => v.Name == "pegi16" && v.GroupName == 'P');
        response.Should().Contain(v => v.Name == "pegi18" && v.GroupName == 'P');
        response.Should().Contain(v => v.Name == "violence" && v.GroupName == 'P');
        response.Should().Contain(v => v.Name == "badLanguage" && v.GroupName == 'P');
        response.Should().Contain(v => v.Name == "fear" && v.GroupName == 'P');
        response.Should().Contain(v => v.Name == "gambling" && v.GroupName == 'P');
        response.Should().Contain(v => v.Name == "sex" && v.GroupName == 'P');
        response.Should().Contain(v => v.Name == "drugs" && v.GroupName == 'P');
        response.Should().Contain(v => v.Name == "discrimination" && v.GroupName == 'P');
        response.Should().Contain(v => v.Name == "inGamePurchases" && v.GroupName == 'P');
        response.Should().Contain(v => v.Name == "singlePlayer" && v.GroupName == 'M');
        response.Should().Contain(v => v.Name == "multiPlayer" && v.GroupName == 'M');
        response.Should().Contain(v => v.Name == "cooperative" && v.GroupName == 'M');
        response.Should().Contain(v => v.Name == "competitive" && v.GroupName == 'M');
        response.Should().Contain(v => v.Name == "mmo" && v.GroupName == 'M');
        response.Should().HaveCount(44);
    }
}
