using FluentAssertions;
using Flurl.Http;
using LinqToDB;
using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Lookups;
using MarkAsPlayed.Api.Modules;
using MarkAsPlayed.Api.Modules.Article.Core.Models;
using System.Net;

namespace MarkAsPlayed.Api.Tests.Modules.Article.Core;

public sealed class ArticleDetailsFixture : IntegrationTest
{
    public long ReviewArticleId = 0;
    public long NewsArticleId = 0;
    public long OtherArticleId = 0;
    public long EmptyArticleId = 0;

    protected override async Task SetUp()
    {
        await using var db = CreateDatabase();
        var testData = new GeneralDatabaseTestData();

        var reviewId = await db.InsertWithInt64IdentityAsync(testData.ReviewArticleExample, db.GetTable<Data.Models.Article>().TableName);
        await db.InsertAsync(testData.CreateArticleReviewData(reviewId), db.GetTable<ArticleReviewData>().TableName);
        await db.InsertAsync(testData.CreateArticleContentData(ArticleTypeHelper.review, reviewId), db.GetTable<ArticleContent>().TableName);

        var newsId = await db.InsertWithInt64IdentityAsync(testData.NewsArticleExample, db.GetTable<Data.Models.Article>().TableName);
        await db.InsertAsync(testData.CreateArticleContentData(ArticleTypeHelper.news, newsId), db.GetTable<ArticleContent>().TableName);

        var otherId = await db.InsertWithInt64IdentityAsync(testData.OtherArticleExample, db.GetTable<Data.Models.Article>().TableName);
        await db.InsertAsync(testData.CreateArticleContentData(ArticleTypeHelper.other, otherId), db.GetTable<ArticleContent>().TableName);

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

        ReviewArticleId = reviewId;
        NewsArticleId = newsId;
        OtherArticleId = otherId;
        EmptyArticleId = reviewId + newsId + otherId;
    }
}

public class ArticleDetailsEndpointTests : IClassFixture<ArticleDetailsFixture>
{
    private readonly ArticleDetailsFixture _suite;

    public ArticleDetailsEndpointTests(ArticleDetailsFixture suite)
    {
        _suite = suite;
    }

    [Fact]
    public async Task ShouldRetrieveReviewArticleData()
    {
        var articleId = _suite.ReviewArticleId;

        var response = await _suite.Client.Request("article", articleId).
                                    GetJsonAsync<FullArticleData>();

        response.Should().BeEquivalentTo(
                new FullArticleData
                {
                    Id = 1,
                    ArticleType = new LookupData
                    {
                        Id = 1,
                        Name = "review",
                        GroupName = 'A'
                    },
                    AvailableOn = new List<LookupData>
                    {
                        new LookupData
                        {
                            Id = 1,
                            Name = "Sony Playstation 5 (PS5)",
                            GroupName = 'P'
                        },
                        new LookupData
                        {
                            Id = 2,
                            Name = "Nintendo Switch (Switch)",
                            GroupName = 'S'

                        }
                    },
                    CreatedAt = new DateTimeOffset(new DateTime(2022, 09, 19)),
                    CreatedBy = new LookupData
                    {
                        Id = 1,
                        Name = "John Doe",
                        GroupName = null
                    },
                    LongDescription = "Review Long Description string",
                    PlayedOn = new LookupData
                    {
                        Id = 1,
                        Name = "Sony Playstation 5 (PS5)",
                        GroupName = 'P'
                    },
                    PlayTime = 15,
                    Producer = "Review Producer string",
                    ShortDescription = "Review Short Description string",
                    Title = "Review Title string"
                }
            );
    }

    [Fact]
    public async Task ShouldRetrieveNewsArticleData()
    {
        var articleId = _suite.NewsArticleId;

        var response = await _suite.Client.Request("article", articleId).
                                    GetJsonAsync<FullArticleData>();

        response.Should().BeEquivalentTo(
                new FullArticleData
                {
                    Id = 2,
                    ArticleType = new LookupData
                    {
                        Id = 2,
                        Name = "news",
                        GroupName = 'A'
                    },
                    AvailableOn = new List<LookupData>
                    {
                        new LookupData
                        {
                            Id = 3,
                            Name = "Microsoft Xbox One (XOne)",
                            GroupName = 'X'
                        }
                    },
                    CreatedAt = new DateTimeOffset(new DateTime(2022, 09, 18)),
                    CreatedBy = new LookupData
                    {
                        Id = 1,
                        Name = "John Doe",
                        GroupName = null
                    },
                    LongDescription = "News Long Description string",
                    PlayedOn = new LookupData
                    {
                        Id = null,
                        Name = null,
                        GroupName = null
                    },
                    PlayTime = null,
                    Producer = null,
                    ShortDescription = "News Short Description string",
                    Title = "News Title string"
                }
            );
    }

    [Fact]
    public async Task ShouldRetrieveOtherArticleData()
    {
        var articleId = _suite.OtherArticleId;

        var response = await _suite.Client.Request("article", articleId).
                                    GetJsonAsync<FullArticleData>();

        response.Should().BeEquivalentTo(
                new FullArticleData
                {
                    Id = 3,
                    ArticleType = new LookupData
                    {
                        Id = 3,
                        Name = "other",
                        GroupName = 'A'
                    },
                    AvailableOn = new List<LookupData> { },
                    CreatedAt = new DateTimeOffset(new DateTime(2022, 09, 17)),
                    CreatedBy = new LookupData
                    {
                        Id = 1,
                        Name = "John Doe",
                        GroupName = null
                    },
                    LongDescription = "Other Long Description string",
                    PlayedOn = new LookupData
                    {
                        Id = null,
                        Name = null,
                        GroupName = null
                    },
                    PlayTime = null,
                    Producer = null,
                    ShortDescription = "Other Short Description string",
                    Title = "Other Title string"
                }
            );
    }

    [Fact]
    public async Task ShouldRetrieveNotFoundOnNotExistingArticle()
    {
        var articleId = _suite.EmptyArticleId;

        var response = await _suite.Client.AllowHttpStatus(HttpStatusCode.NotFound).
                                    Request("article", articleId).
                                    GetAsync();

        response.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
    }
}
