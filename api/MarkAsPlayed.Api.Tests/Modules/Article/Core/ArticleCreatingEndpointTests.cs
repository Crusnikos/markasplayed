using FluentAssertions;
using Flurl.Http;
using LinqToDB;
using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Modules;
using MarkAsPlayed.Api.Modules.Article.Core.Models;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace MarkAsPlayed.Api.Tests.Modules.Article.Core;

public class ArticleCreatingEndpointTests : IClassFixture<IntegrationTest>, IAsyncLifetime
{
    private readonly IntegrationTest _suite;
    private readonly GeneralDatabaseTestData _testData;

    public ArticleCreatingEndpointTests(IntegrationTest suite)
    {
        _suite = suite;
        _testData = new GeneralDatabaseTestData();
    }

    public Task InitializeAsync()
    {
        return Task.CompletedTask;
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
                                    Request("article").
                                    PostJsonAsync(request);
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
                                    Request("article").
                                    PostJsonAsync(request);
        response.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
    }

    [Theory]
    [ClassData(typeof(ArticleSharedTestData.InvalidUnprocessableEntity))]
    public async Task ShouldReturn422WhenADataIsUnprocessable(ArticleRequestData request)
    {
        var response = await _suite.Client.AllowHttpStatus(HttpStatusCode.UnprocessableEntity).
                                    Request("article").
                                    PostJsonAsync(request);
        response.StatusCode.Should().Be((int)HttpStatusCode.UnprocessableEntity);
    }

    [Fact]
    public async Task ShouldCreateAnReviewArticle()
    {
        var response = await _suite.Client.
            Request("article").
            PostJsonAsync(
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

        var data = await response.GetJsonAsync<int>();
        data.Should().BeGreaterThan(0);

        await using var db = _suite.CreateDatabase();

        var article = await db.Articles.Where(t => t.Id == data).FirstOrDefaultAsync();
        var articleReviewData = await db.ArticlesReviewData.Where(t => t.ArticleId == data).FirstOrDefaultAsync();
        var articleContent = await db.ArticlesContent.Where(t => t.ArticleId == data).FirstOrDefaultAsync();

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
                 _testData.CreateArticleReviewData(data),
                 options => options.Excluding(o => o!.ArticleId)
             );

        articleContent.Should().
             NotBeNull().
             And.
             BeEquivalentTo(
                 _testData.CreateArticleContentData(ArticleTypeHelper.review, data),
                 options => options.Excluding(o => o.ArticleId)
             );
    }

    [Fact]
    public async Task ShouldCreateANewsArticle()
    {
        var response = await _suite.Client.
            Request("article").
            PostJsonAsync(
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

        var data = await response.GetJsonAsync<int>();
        data.Should().BeGreaterThan(0);

        await using var db = _suite.CreateDatabase();

        var article = await db.Articles.Where(t => t.Id == data).FirstOrDefaultAsync();
        var articleReviewData = await db.ArticlesReviewData.Where(t => t.ArticleId == data).FirstOrDefaultAsync();
        var articleContent = await db.ArticlesContent.Where(t => t.ArticleId == data).FirstOrDefaultAsync();

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
                 _testData.CreateArticleContentData(ArticleTypeHelper.news, data),
                 options => options.Excluding(o => o.ArticleId)
             );
    }

    [Fact]
    public async Task ShouldCreateAnOtherArticle()
    {
        var response = await _suite.Client.
            Request("article").
            PostJsonAsync(
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

        var data = await response.GetJsonAsync<int>();
        data.Should().BeGreaterThan(0);

        await using var db = _suite.CreateDatabase();

        var article = await db.Articles.Where(t => t.Id == data).FirstOrDefaultAsync();
        var articleReviewData = await db.ArticlesReviewData.Where(t => t.ArticleId == data).FirstOrDefaultAsync();
        var articleContent = await db.ArticlesContent.Where(t => t.ArticleId == data).FirstOrDefaultAsync();

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
                 _testData.CreateArticleContentData(ArticleTypeHelper.other, data),
                 options => options.Excluding(o => o.ArticleId)
             );
    }
}
