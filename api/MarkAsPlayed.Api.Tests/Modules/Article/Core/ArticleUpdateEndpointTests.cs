using FluentAssertions;
using Flurl.Http;
using LinqToDB;
using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Modules;
using MarkAsPlayed.Api.Modules.Article.Core.Models;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace MarkAsPlayed.Api.Tests.Modules.Article.Core;

public sealed class ArticleUpdateEndpointTests : IClassFixture<IntegrationTest>, IAsyncLifetime
{
    private readonly IntegrationTest _suite;
    private readonly GeneralDatabaseTestData _testData;
    private long _articleId = 0;

    public ArticleUpdateEndpointTests(IntegrationTest suite)
    {
        _suite = suite;
        _testData = new GeneralDatabaseTestData();
    }

    public async Task InitializeAsync()
    {
        await using var db = _suite.CreateDatabase();
        var id = await db.InsertWithInt64IdentityAsync(_testData.ReviewArticleExample, db.GetTable<Data.Models.Article>().TableName);
        await db.InsertAsync(_testData.CreateArticleReviewData(id), db.GetTable<ArticleReviewData>().TableName);
        await db.InsertAsync(_testData.CreateArticleContentData(ArticleTypeHelper.review, id), db.GetTable<ArticleContent>().TableName);

        await db.ArticleGamingPlatforms.InsertAsync(
            () => new ArticleGamingPlatform
            {
                ArticleId = id,
                GamingPlatformId = 1
            }
        );

        await db.ArticleGamingPlatforms.InsertAsync(
            () => new ArticleGamingPlatform
            {
                ArticleId = id,
                GamingPlatformId = 2
            }
        );

        _articleId = id;
    }

    public Task DisposeAsync()
    {
        return Task.CompletedTask;
    }

    [Theory]
    [ClassData(typeof(ArticleSharedTestData.MalformedArticleData))]
    public async Task ShouldFailValidationWithMalformedRequest(
        ArticleRequestData request,
        string property,
        string pattern)
    {
        var response = await _suite.Client.AllowHttpStatus(HttpStatusCode.BadRequest).
                                    Request("article/1").
                                    PutJsonAsync(request);
        response.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);

        var data = await response.GetJsonAsync<ValidationProblemDetails>();

        data.Errors.Should().
             ContainKey(property).
             WhoseValue.Should().
             ContainMatch(pattern);
    }

    [Theory]
    [ClassData(typeof(ArticleSharedTestData.InvalidReferenceArticleData))]
    public async Task ShouldReturn404WhenADataReferenceIsInvalid(ArticleRequestData request)
    {
        var response = await _suite.Client.AllowHttpStatus(HttpStatusCode.NotFound).
                                    Request("article/1").
                                    PutJsonAsync(request);
        response.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
    }

    [Theory]
    [ClassData(typeof(ArticleSharedTestData.InvalidArticleDataId))]
    public async Task ShouldReturn404WhenArticleNotFound(ArticleRequestData request)
    {
        var response = await _suite.Client.AllowHttpStatus(HttpStatusCode.NotFound).
                                    Request("article/2000").
                                    PutJsonAsync(request);
        response.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
    }

    [Theory]
    [ClassData(typeof(ArticleSharedTestData.InvalidUnprocessableEntity))]
    public async Task ShouldReturn422WhenADataIsUnprocessable(ArticleRequestData request)
    {
        var response = await _suite.Client.AllowHttpStatus(HttpStatusCode.UnprocessableEntity).
                                    Request("article/1").
                                    PutJsonAsync(request);
        response.StatusCode.Should().Be((int)HttpStatusCode.UnprocessableEntity);
    }

    [Fact]
    public async Task ShouldUpdateToAnReviewArticle()
    {
        var articleId = _articleId;

        var response = await _suite.Client.
            Request($"article/{articleId}").
            PutJsonAsync(
                new ArticleRequestData
                {
                    Title = "Review Title string",
                    PlayedOn = 1,
                    AvailableOn = new List<int> { 1, 2, 3 },
                    Producer = "Review Producer string",
                    PlayTime = 15,
                    ShortDescription = "Review Short Description string",
                    LongDescription = "Review Long Description string",
                    ArticleType = (int)ArticleTypeHelper.review
                }
            );

        response.StatusCode.Should().Be((int)HttpStatusCode.NoContent);

        await using var db = _suite.CreateDatabase();

        var article = await db.Articles.Where(t => t.Id == articleId).FirstOrDefaultAsync();
        var articleReviewData = await db.ArticlesReviewData.Where(t => t.ArticleId == articleId).FirstOrDefaultAsync();
        var articleContent = await db.ArticlesContent.Where(t => t.ArticleId == articleId).FirstOrDefaultAsync();

        article.Should().
             NotBeNull().
             And.
             BeEquivalentTo(
                 _testData.ReviewArticleExample,
                 options => options.Excluding(o => o.Id).Excluding(o => o.CreatedAt)
             );

        articleReviewData.Should().
             NotBeNull().
             And.
             BeEquivalentTo(
                 _testData.CreateArticleReviewData(articleId),
                 options => options.Excluding(o => o!.ArticleId)
             );

        articleContent.Should().
             NotBeNull().
             And.
             BeEquivalentTo(
                 _testData.CreateArticleContentData(ArticleTypeHelper.review, articleId),
                 options => options.Excluding(o => o.ArticleId)
             );
    }

    [Fact]
    public async Task ShouldUpdateToANewsArticle()
    {
        var articleId = _articleId;

        var response = await _suite.Client.
            Request($"article/{articleId}").
            PutJsonAsync(
                new ArticleRequestData
                {
                    Title = "News Title string",
                    PlayedOn = null,
                    AvailableOn = new List<int> { 1, 2, 3 },
                    Producer = null,
                    PlayTime = null,
                    ShortDescription = "News Short Description string",
                    LongDescription = "News Long Description string",
                    ArticleType = (int)ArticleTypeHelper.news
                }
            );

        response.StatusCode.Should().Be((int)HttpStatusCode.NoContent);

        await using var db = _suite.CreateDatabase();

        var article = await db.Articles.Where(t => t.Id == articleId).FirstOrDefaultAsync();
        var articleReviewData = await db.ArticlesReviewData.Where(t => t.ArticleId == articleId).FirstOrDefaultAsync();
        var articleContent = await db.ArticlesContent.Where(t => t.ArticleId == articleId).FirstOrDefaultAsync();

        article.Should().
             NotBeNull().
             And.
             BeEquivalentTo(
                 _testData.NewsArticleExample,
                 options => options.Excluding(o => o.Id).Excluding(o => o.CreatedAt)
             );

        articleReviewData.Should().BeNull();

        articleContent.Should().
             NotBeNull().
             And.
             BeEquivalentTo(
                 _testData.CreateArticleContentData(ArticleTypeHelper.news, articleId),
                 options => options.Excluding(o => o.ArticleId)
             );
    }

    [Fact]
    public async Task ShouldUpdateToAnOtherArticle()
    {
        var articleId = _articleId;

        var response = await _suite.Client.
            Request($"article/{articleId}").
            PutJsonAsync(
                new ArticleRequestData
                {
                    Title = "Other Title string",
                    PlayedOn = null,
                    AvailableOn = null,
                    Producer = null,
                    PlayTime = null,
                    ShortDescription = "Other Short Description string",
                    LongDescription = "Other Long Description string",
                    ArticleType = (int)ArticleTypeHelper.other
                }
            );

        response.StatusCode.Should().Be((int)HttpStatusCode.NoContent);

        await using var db = _suite.CreateDatabase();

        var article = await db.Articles.Where(t => t.Id == articleId).FirstOrDefaultAsync();
        var articleReviewData = await db.ArticlesReviewData.Where(t => t.ArticleId == articleId).FirstOrDefaultAsync();
        var articleContent = await db.ArticlesContent.Where(t => t.ArticleId == articleId).FirstOrDefaultAsync();

        article.Should().
             NotBeNull().
             And.
             BeEquivalentTo(
                 _testData.OtherArticleExample,
                 options => options.Excluding(o => o.Id).Excluding(o => o.CreatedAt)
             );

        articleReviewData.Should().BeNull();

        articleContent.Should().
             NotBeNull().
             And.
             BeEquivalentTo(
                 _testData.CreateArticleContentData(ArticleTypeHelper.other, articleId),
                 options => options.Excluding(o => o.ArticleId)
             );
    }
}
