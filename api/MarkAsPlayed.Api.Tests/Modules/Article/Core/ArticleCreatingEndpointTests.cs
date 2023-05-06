using FluentAssertions;
using Flurl.Http;
using LinqToDB;
using MarkAsPlayed.Api.Modules;
using MarkAsPlayed.Api.Modules.Article.Core.Models;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using ArticleData = MarkAsPlayed.Api.Data.Models.Article;

namespace MarkAsPlayed.Api.Tests.Modules.Article.Core;

public class ArticleCreatingEndpointTests : IClassFixture<IntegrationTest>, IAsyncLifetime
{
    private readonly IntegrationTest _suite;

    public ArticleCreatingEndpointTests(IntegrationTest suite)
    {
        _suite = suite;
    }

    public Task InitializeAsync()
    {
        return Task.CompletedTask;
    }

    public async Task DisposeAsync()
    {
        await using var db = _suite.CreateDatabase();
        await db.Articles.DeleteAsync();
        await db.ArticleGamingPlatforms.DeleteAsync();
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
                    Title = "Example Title",
                    PlayedOn = 1,
                    AvailableOn = new List<int> { 1, 2, 3 },
                    Producer = "Example Producer",
                    PlayTime = 123,
                    ShortDescription = "Example Short Description",
                    LongDescription = "Example Long Description",
                    ArticleType = (int)ArticleTypeHelper.review
                }
            );

        var data = await response.GetJsonAsync<int>();
        data.Should().BeGreaterThan(0);

        await using var db = _suite.CreateDatabase();

        var item = await db.Articles.Where(t => t.Id == data).FirstOrDefaultAsync();

        item.Should().
             NotBeNull().
             And.
             BeEquivalentTo(
                 new ArticleData
                 {
                     Title = "Example Title",
                     PlayedOnGamingPlatformId = 1,
                     Producer = "Example Producer",
                     PlayTime = 123,
                     ArticleTypeId = 1,
                     ShortDescription = "Example Short Description",
                     LongDescription = "Example Long Description",
                     CreatedBy = 1
                 },
                 options => options.Excluding(o => o.Id).Excluding(o => o.CreatedAt)
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
                    Title = "Example Title",
                    PlayedOn = null,
                    AvailableOn = new List<int> { 1, 2, 3 },
                    Producer = null,
                    PlayTime = null,
                    ShortDescription = "Example Short Description",
                    LongDescription = "Example Long Description",
                    ArticleType = (int)ArticleTypeHelper.news
                }
            );

        var data = await response.GetJsonAsync<int>();
        data.Should().BeGreaterThan(0);

        await using var db = _suite.CreateDatabase();

        var item = await db.Articles.Where(t => t.Id == data).FirstOrDefaultAsync();

        item.Should().
             NotBeNull().
             And.
             BeEquivalentTo(
                 new ArticleData
                 {
                     Title = "Example Title",
                     PlayedOnGamingPlatformId = null,
                     Producer = null,
                     PlayTime = null,
                     ArticleTypeId = 2,
                     ShortDescription = "Example Short Description",
                     LongDescription = "Example Long Description",
                     CreatedBy = 1
                 },
                 options => options.Excluding(o => o.Id).Excluding(o => o.CreatedAt)
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
                    Title = "Example Title",
                    PlayedOn = null,
                    AvailableOn = null,
                    Producer = null,
                    PlayTime = null,
                    ShortDescription = "Example Short Description",
                    LongDescription = "Example Long Description",
                    ArticleType = (int)ArticleTypeHelper.other
                }
            );

        var data = await response.GetJsonAsync<int>();
        data.Should().BeGreaterThan(0);

        await using var db = _suite.CreateDatabase();

        var item = await db.Articles.Where(t => t.Id == data).FirstOrDefaultAsync();

        item.Should().
             NotBeNull().
             And.
             BeEquivalentTo(
                 new ArticleData
                 {
                     Title = "Example Title",
                     PlayedOnGamingPlatformId = null,
                     Producer = null,
                     PlayTime = null,
                     ArticleTypeId = 3,
                     ShortDescription = "Example Short Description",
                     LongDescription = "Example Long Description",
                     CreatedBy = 1
                 },
                 options => options.Excluding(o => o.Id).Excluding(o => o.CreatedAt)
             );
    }
}
