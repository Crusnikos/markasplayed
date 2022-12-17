using FluentAssertions;
using Flurl.Http;
using LinqToDB;
using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Modules.Article.Core.Models;

namespace MarkAsPlayed.Api.Tests.Modules.Article.Core;

public sealed class ArticleListingFixture : IntegrationTest
{
    protected override async Task SetUp()
    {
        await using var db = CreateDatabase();

        await db.Articles.InsertAsync(
            () => new Data.Models.Article
            {
                Id = 1,
                ArticleTypeId = 1,
                CreatedAt = new DateTimeOffset(new DateTime(2022, 09, 19)),
                CreatedBy = 1,
                LongDescription = "Review Long Description string",
                PlayedOnGamingPlatformId = 1,
                PlayTime = 15,
                Producer = "Review Producer string",
                ShortDescription = "Review Short Description string",
                Title = "Review Title string"
            }
        );

        await db.Articles.InsertAsync(
            () => new Data.Models.Article
            {
                Id = 2,
                ArticleTypeId = 2,
                CreatedAt = new DateTimeOffset(new DateTime(2022, 09, 18)),
                CreatedBy = 1,
                LongDescription = "News Long Description string",
                PlayedOnGamingPlatformId = null,
                PlayTime = null,
                Producer = null,
                ShortDescription = "News Short Description string",
                Title = "News Title string"
            }
        );

        for (int i = 3; i < 7; i++)
        {
            await db.Articles.InsertAsync(
                () => new Data.Models.Article
                {
                    Id = i,
                    ArticleTypeId = 3,
                    CreatedAt = new DateTimeOffset(new DateTime(2022, i, 17)),
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

        await db.ArticleGamingPlatforms.InsertAsync(
            () => new ArticleGamingPlatform
            {
                ArticleId = 1,
                GamingPlatformId = 1
            }
        );

        await db.ArticleGamingPlatforms.InsertAsync(
            () => new ArticleGamingPlatform
            {
                ArticleId = 1,
                GamingPlatformId = 2
            }
        );

        await db.ArticleGamingPlatforms.InsertAsync(
            () => new ArticleGamingPlatform
            {
                ArticleId = 2,
                GamingPlatformId = 3
            }
        );
    }
}

public class ArticleListingEndpointTests : IClassFixture<ArticleListingFixture>
{
    private readonly ArticleListingFixture _suite;

    public ArticleListingEndpointTests(ArticleListingFixture suite)
    {
        _suite = suite;
    }

    [Fact]
    public async Task ShouldRetrieveArticlesListing()
    {
        var response = await _suite.Client.Request("article", "listing").
                                    SetQueryParam("page", 1).
                                    GetAsync();

        response.Headers.Should().HaveCount(3);

        response.Headers.Should().
            Contain(pair => pair.Name == "display-page").
            Which.Value.Should().Be("1");

        response.Headers.Should().
            Contain(pair => pair.Name == "articles-count").
            Which.Value.Should().Be("6");

        var jsonSerializedResponse = await response.GetJsonAsync<IEnumerable<DashboardArticleData>>();

        jsonSerializedResponse.Should().HaveCount(5);
    }

    [Fact]
    public async Task ShouldRetrieveEmptyListingWhenGivenPageNotExist()
    {
        var response = await _suite.Client.Request("article", "listing").
                                    SetQueryParam("page", 3).
                                    GetAsync();

        response.Headers.Should().HaveCount(3);

        response.Headers.Should().
            Contain(pair => pair.Name == "display-page").
            Which.Value.Should().Be("3");

        response.Headers.Should().
            Contain(pair => pair.Name == "articles-count").
            Which.Value.Should().Be("6");

        var jsonSerializedResponse = await response.GetJsonAsync<IEnumerable<DashboardArticleData>>();

        jsonSerializedResponse.Should().HaveCount(0);
    }
}
