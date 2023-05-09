using FluentAssertions;
using Flurl.Http;
using LinqToDB;
using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Lookups;
using MarkAsPlayed.Api.Modules;
using MarkAsPlayed.Api.Modules.Article.Tags.Models;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace MarkAsPlayed.Api.Tests.Modules.Article.Tags;

public sealed class TagsCreatingEndpointTests : IClassFixture<IntegrationTest>, IAsyncLifetime
{
    private readonly IntegrationTest _suite;
    private readonly GeneralDatabaseTestData _testData;
    private long ReviewArticleId = 0;

    public TagsCreatingEndpointTests(IntegrationTest suite)
    {
        _suite = suite;
        _testData = new GeneralDatabaseTestData();
    }

    public async Task InitializeAsync()
    {
        await using var db = _suite.CreateDatabase();

        var reviewId = await db.InsertWithInt64IdentityAsync(_testData.ReviewArticleExample, db.GetTable<Data.Models.Article>().TableName);
        await db.InsertAsync(_testData.CreateArticleReviewData(reviewId), db.GetTable<ArticleReviewData>().TableName);
        await db.InsertAsync(_testData.CreateArticleContentData(ArticleTypeHelper.review, reviewId), db.GetTable<ArticleContent>().TableName);

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

        await db.ArticleTags.InsertAsync(
            () => new ArticleTag
            {
                ArticleId = reviewId,
                TagId = 3,
                IsActive = false
            }
        );

        ReviewArticleId = reviewId;
    }

    public Task DisposeAsync()
    {
        return Task.CompletedTask;
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
                                    PostJsonAsync(request);
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
                                    PostJsonAsync(request);
        response.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task ShouldCreateArticleTag()
    {
        var articleId = ReviewArticleId;

        await using var db = _suite.CreateDatabase();
        var testedTag = await db.Tags.Where(t => t.Id == 2).FirstOrDefaultAsync();

        var response = await _suite.Client.
            Request("tags").
            PostJsonAsync(
                new TagRequestData
                {
                    ArticleId = (int)articleId,
                    TagId = testedTag!.Id,
                }
            );

        response.StatusCode.Should().Be((int)HttpStatusCode.NoContent);

        var articleTag = await db.ArticleTags.Where(t => t.TagId == testedTag!.Id && t.ArticleId == articleId).FirstOrDefaultAsync();

        articleTag.Should().
             NotBeNull().
             And.
             BeEquivalentTo(
                 new ArticleTag
                 {
                     ArticleId = articleId,
                     TagId = testedTag!.Id,
                     IsActive = true
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

    [Fact]
    public async Task ShouldReactivatePreviouslyCreatedArticleTag()
    {
        var articleId = ReviewArticleId;

        await using var db = _suite.CreateDatabase();
        var testedTag = await db.Tags.Where(t => t.Id == 3).FirstOrDefaultAsync();
        var articleTestedTag = await db.ArticleTags.Where(t => t.TagId == testedTag!.Id && t.ArticleId == articleId).FirstOrDefaultAsync();

        articleTestedTag.Should().
             NotBeNull().
             And.
             BeEquivalentTo(
                 new ArticleTag
                 {
                     ArticleId = articleId,
                     TagId = testedTag!.Id,
                     IsActive = false
                 }
             );

        var response = await _suite.Client.
            Request("tags").
            PostJsonAsync(
                new TagRequestData
                {
                    ArticleId = (int)articleId,
                    TagId = testedTag!.Id,
                }
            );

        response.StatusCode.Should().Be((int)HttpStatusCode.NoContent);

        var articleTag = await db.ArticleTags.Where(t => t.TagId == testedTag!.Id && t.ArticleId == articleId).FirstOrDefaultAsync();

        articleTag.Should().
             NotBeNull().
             And.
             BeEquivalentTo(
                 new ArticleTag
                 {
                     ArticleId = articleId,
                     TagId = testedTag!.Id,
                     IsActive = true
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
