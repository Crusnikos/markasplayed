using FluentAssertions;
using Flurl.Http;
using LinqToDB;
using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Modules.Article.Core.Models;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using ArticleData = MarkAsPlayed.Api.Data.Models.Article;

namespace MarkAsPlayed.Api.Tests.Modules.Article.Core;

public sealed class ArticleUpdateEndpointTests : IClassFixture<IntegrationTest>, IAsyncLifetime
{
    private readonly IntegrationTest _suite;

    public ArticleUpdateEndpointTests(IntegrationTest suite)
    {
        _suite = suite;
    }

    public async Task InitializeAsync()
    {
        await using var db = _suite.CreateDatabase();

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

    [Fact]
    public async Task ShouldUpdateToAnReviewArticle()
    {
        var response = await _suite.Client.
            Request("article/1").
            PutJsonAsync(
                new ArticleRequestData
                {
                    Title = "Example Title",
                    PlayedOn = 1,
                    AvailableOn = new List<int> { 1, 2, 3 },
                    Producer = "Example Producer",
                    PlayTime = 123,
                    ShortDescription = "Example Short Description",
                    LongDescription = "Example Long Description",
                    ArticleType = 1
                }
            );

        response.StatusCode.Should().Be((int)HttpStatusCode.NoContent);

        await using var db = _suite.CreateDatabase();

        var item = await db.Articles.Where(t => t.Id == 1).FirstOrDefaultAsync();

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
    public async Task ShouldUpdateToANewsArticle()
    {
        var response = await _suite.Client.
            Request("article/1").
            PutJsonAsync(
                new ArticleRequestData
                {
                    Title = "Example Title",
                    PlayedOn = null,
                    AvailableOn = new List<int> { 1, 2, 3 },
                    Producer = null,
                    PlayTime = null,
                    ShortDescription = "Example Short Description",
                    LongDescription = "Example Long Description",
                    ArticleType = 1
                }
            );

        response.StatusCode.Should().Be((int)HttpStatusCode.NoContent);

        await using var db = _suite.CreateDatabase();

        var item = await db.Articles.Where(t => t.Id == 1).FirstOrDefaultAsync();

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
                     ArticleTypeId = 1,
                     ShortDescription = "Example Short Description",
                     LongDescription = "Example Long Description",
                     CreatedBy = 1
                 },
                 options => options.Excluding(o => o.Id).Excluding(o => o.CreatedAt)
             );
    }

    [Fact]
    public async Task ShouldUpdateToAnOtherArticle()
    {
        var response = await _suite.Client.
            Request("article/1").
            PutJsonAsync(
                new ArticleRequestData
                {
                    Title = "Example Title",
                    PlayedOn = null,
                    AvailableOn = null,
                    Producer = null,
                    PlayTime = null,
                    ShortDescription = "Example Short Description",
                    LongDescription = "Example Long Description",
                    ArticleType = 1
                }
            );

        response.StatusCode.Should().Be((int)HttpStatusCode.NoContent);

        await using var db = _suite.CreateDatabase();

        var item = await db.Articles.Where(t => t.Id == 1).FirstOrDefaultAsync();

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
                     ArticleTypeId = 1,
                     ShortDescription = "Example Short Description",
                     LongDescription = "Example Long Description",
                     CreatedBy = 1
                 },
                 options => options.Excluding(o => o.Id).Excluding(o => o.CreatedAt)
             );
    }
}
