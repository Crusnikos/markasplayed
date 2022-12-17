using FluentAssertions;
using Flurl.Http;
using LinqToDB;
using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Modules.Article.Tags.Models;

namespace MarkAsPlayed.Api.Tests.Modules.Article.Tags;

public sealed class TagsByArticleIdFixture : IntegrationTest
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

        await db.ArticleGamingPlatforms.InsertAsync(
            () => new ArticleGamingPlatform
            {
                ArticleId = 1,
                GamingPlatformId = 1
            }
        );

        await db.ArticleTags.InsertAsync(
            () => new ArticleTag
            {
                TagId = 1,
                ArticleId = 1,
                IsActive = true,
            }
        );

        await db.ArticleTags.InsertAsync(
            () => new ArticleTag
            {
                TagId = 10,
                ArticleId = 1,
                IsActive = true,
            }
        );

        await db.ArticleTags.InsertAsync(
            () => new ArticleTag
            {
                TagId = 20,
                ArticleId = 1,
                IsActive = true,
            }
        );
    }
}

public class TagsByArticleIdEndpointTests : IClassFixture<TagsByArticleIdFixture>
{
    private readonly TagsByArticleIdFixture _suite;

    public TagsByArticleIdEndpointTests(TagsByArticleIdFixture suite)
    {
        _suite = suite;
    }

    [Fact]
    public async Task ShouldRetrieveTagsData()
    {
        var response = await _suite.Client.Request("tags", "article", "1").
                                    GetAsync();

        var jsonSerializedResponse = await response.GetJsonAsync<IEnumerable<TagData>>();

        jsonSerializedResponse.Should().HaveCount(3);
    }

    [Fact]
    public async Task ShouldRetrieveEmptyListOnZeroArticleTags()
    {
        var response = await _suite.Client.Request("tags", "article", "2").
                                    GetAsync();

        var jsonSerializedResponse = await response.GetJsonAsync<IEnumerable<TagData>>();

        jsonSerializedResponse.Should().HaveCount(0);
    }
}
