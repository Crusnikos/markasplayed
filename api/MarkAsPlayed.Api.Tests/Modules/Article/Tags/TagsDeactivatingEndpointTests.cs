using FluentAssertions;
using Flurl.Http;
using LinqToDB;
using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Lookups;
using MarkAsPlayed.Api.Modules.Article.Tags.Models;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace MarkAsPlayed.Api.Tests.Modules.Article.Tags;

public sealed class TagsDeactivatingEndpointTests : IClassFixture<IntegrationTest>, IAsyncLifetime
{
    private readonly IntegrationTest _suite;

    public TagsDeactivatingEndpointTests(IntegrationTest suite)
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

        await db.ArticleTags.InsertAsync(
            () => new ArticleTag
            {
                ArticleId = 1,
                TagId = 3,
                IsActive = true
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
    [ClassData(typeof(TagSharedTestData.MalformedTagData))]
    public async Task ShouldFailValidationWithMalformedRequest(
        TagRequestData request,
        string property,
        string pattern)
    {
        var response = await _suite.Client.AllowHttpStatus(HttpStatusCode.BadRequest).
                                    Request("tags").
                                    PutJsonAsync(request);
        response.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);

        var data = await response.GetJsonAsync<ValidationProblemDetails>();

        data.Errors.Should().
             ContainKey(property).
             WhoseValue.Should().
             ContainMatch(pattern);
    }

    [Theory]
    [ClassData(typeof(TagSharedTestData.InvalidReferenceTagData))]
    public async Task ShouldReturn404WhenADataReferenceIsInvalid(TagRequestData request)
    {
        var response = await _suite.Client.AllowHttpStatus(HttpStatusCode.NotFound).
                                    Request("tags").
                                    PutJsonAsync(request);
        response.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ShouldDeactivateArticleTag()
    {
        await using var db = _suite.CreateDatabase();
        var testedTag = await db.Tags.Where(t => t.Id == 3).FirstOrDefaultAsync();
        var articleTestedTag = await db.ArticleTags.Where(t => t.TagId == testedTag!.Id).FirstOrDefaultAsync();

        articleTestedTag.Should().
             NotBeNull().
             And.
             BeEquivalentTo(
                 new ArticleTag
                 {
                     ArticleId = 1,
                     TagId = testedTag!.Id,
                     IsActive = true
                 }
             );

        var response = await _suite.Client.
            Request("tags").
            PutJsonAsync(
                new TagRequestData
                {
                    ArticleId = 1,
                    TagId = testedTag!.Id,
                }
            );

        response.StatusCode.Should().Be((int)HttpStatusCode.NoContent);

        var articleTag = await db.ArticleTags.Where(t => t.TagId == testedTag!.Id).FirstOrDefaultAsync();

        articleTag.Should().
             NotBeNull().
             And.
             BeEquivalentTo(
                 new ArticleTag
                 {
                     ArticleId = 1,
                     TagId = testedTag!.Id,
                     IsActive = false
                 }
             );

        var tagData = await db.Tags.Where(t => t.Id == articleTag!.TagId).FirstOrDefaultAsync();

        tagData.Should().
             NotBeNull().
             And.
             BeEquivalentTo(
                 new LookupData
                 {
                     Id = articleTag!.TagId,
                     Name = testedTag!.Name,
                     GroupName = testedTag!.GroupName
                 }
             );
    }
}
