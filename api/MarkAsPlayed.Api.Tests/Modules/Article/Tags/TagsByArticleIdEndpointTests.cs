using FluentAssertions;
using Flurl.Http;
using LinqToDB;
using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Modules;
using MarkAsPlayed.Api.Modules.Article.Tags.Models;

namespace MarkAsPlayed.Api.Tests.Modules.Article.Tags;

public sealed class TagsByArticleIdFixture : IntegrationTest
{
    public long ReviewArticleId = 0;
    public long NewsArticleId = 0;

    protected override async Task SetUp()
    {
        await using var db = CreateDatabase();
        var testData = new GeneralDatabaseTestData();

        var reviewId = await db.InsertWithInt64IdentityAsync(testData.ReviewArticleExample, db.GetTable<Data.Models.Article>().TableName);
        await db.InsertAsync(testData.CreateArticleReviewData(reviewId), db.GetTable<ArticleReviewData>().TableName);
        await db.InsertAsync(testData.CreateArticleContentData(ArticleTypeHelper.review, reviewId), db.GetTable<ArticleContent>().TableName);

        var newsId = await db.InsertWithInt64IdentityAsync(testData.NewsArticleExample, db.GetTable<Data.Models.Article>().TableName);
        await db.InsertAsync(testData.CreateArticleContentData(ArticleTypeHelper.news, newsId), db.GetTable<ArticleContent>().TableName);

        await db.ArticleGamingPlatforms.InsertAsync(
            () => new ArticleGamingPlatform
            {
                ArticleId = reviewId,
                GamingPlatformId = 1
            }
        );

        await db.ArticleTags.InsertAsync(
            () => new ArticleTag
            {
                TagId = 1,
                ArticleId = reviewId,
                IsActive = true,
            }
        );

        await db.ArticleTags.InsertAsync(
            () => new ArticleTag
            {
                TagId = 10,
                ArticleId = reviewId,
                IsActive = true,
            }
        );

        await db.ArticleTags.InsertAsync(
            () => new ArticleTag
            {
                TagId = 20,
                ArticleId = reviewId,
                IsActive = true,
            }
        );

        ReviewArticleId = reviewId;
        NewsArticleId = newsId;
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
        var articleId = _suite.ReviewArticleId;

        var response = await _suite.Client.Request("tags", "article", articleId).
                                    GetAsync();

        var jsonSerializedResponse = await response.GetJsonAsync<IEnumerable<TagData>>();

        jsonSerializedResponse.Should().HaveCount(3);
    }

    [Fact]
    public async Task ShouldRetrieveEmptyListOnZeroArticleTags()
    {
        var articleId = _suite.NewsArticleId;

        var response = await _suite.Client.Request("tags", "article", articleId).
                                    GetAsync();

        var jsonSerializedResponse = await response.GetJsonAsync<IEnumerable<TagData>>();

        jsonSerializedResponse.Should().HaveCount(0);
    }
}
