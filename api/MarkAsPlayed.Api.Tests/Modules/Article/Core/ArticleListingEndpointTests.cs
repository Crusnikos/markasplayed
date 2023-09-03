using FluentAssertions;
using Flurl.Http;
using LinqToDB;
using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Modules;
using MarkAsPlayed.Api.Modules.Article.Core.Models;

namespace MarkAsPlayed.Api.Tests.Modules.Article.Core;

public sealed class ArticleListingFixture : IntegrationTest
{
    protected override async Task SetUp()
    {
        await using var db = CreateDatabase();
        var testData = new GeneralDatabaseTestData();

        var reviewId = await db.InsertWithInt64IdentityAsync(testData.ReviewArticleExample, db.GetTable<Data.Models.Article>().TableName);
        await db.InsertAsync(testData.CreateArticleReviewData(reviewId), db.GetTable<ArticleReviewData>().TableName);
        await db.InsertAsync(testData.CreateArticleContentData(ArticleTypeHelper.review, reviewId), db.GetTable<ArticleContent>().TableName);

        var newsId = await db.InsertWithInt64IdentityAsync(testData.NewsArticleExample, db.GetTable<Data.Models.Article>().TableName);
        await db.InsertAsync(testData.CreateArticleContentData(ArticleTypeHelper.news, newsId), db.GetTable<ArticleContent>().TableName);

        for (int i = (int)(newsId + 1); i < (int)(newsId + 10); i++)
        {
            await db.Articles.InsertAsync(
                () => new Data.Models.Article
                {
                    Id = i,
                    ArticleTypeId = 3,
                    CreatedAt = new DateTimeOffset(new DateTime(2022, i, 17)),
                    CreatedBy = 1,
                    ShortDescription = "Other Short Description string",
                    Title = "Other Title string"
                }
            );

            await db.ArticlesContent.InsertAsync(
                () => new ArticleContent
                {
                    ArticleId = i,
                    LongDescription = "Other Long Description string"
                }
            );
        }

        await db.ArticleGamingPlatforms.InsertAsync(
            () => new ArticleGamingPlatform
            {
                ArticleId = reviewId,
                GamingPlatformId = 1
            }
        );

        await db.ArticleGamingPlatforms.InsertAsync(
            () => new ArticleGamingPlatform
            {
                ArticleId = reviewId,
                GamingPlatformId = 2
            }
        );

        await db.ArticleGamingPlatforms.InsertAsync(
            () => new ArticleGamingPlatform
            {
                ArticleId = newsId,
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
            Which.Value.Should().Be("11");

        var jsonSerializedResponse = await response.GetJsonAsync<IEnumerable<DashboardArticleData>>();

        jsonSerializedResponse.Should().HaveCount(10);
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
            Which.Value.Should().Be("11");

        var jsonSerializedResponse = await response.GetJsonAsync<IEnumerable<DashboardArticleData>>();

        jsonSerializedResponse.Should().HaveCount(0);
    }
}
