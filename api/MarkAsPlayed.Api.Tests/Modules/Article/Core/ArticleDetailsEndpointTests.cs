using FluentAssertions;
using Flurl.Http;
using LinqToDB;
using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Lookups;
using MarkAsPlayed.Api.Modules.Article.Core.Models;
using System.Net;

namespace MarkAsPlayed.Api.Tests.Modules.Article.Core;

public sealed class ArticleDetailsFixture : IntegrationTest
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

        await db.Articles.InsertAsync(
            () => new Data.Models.Article
            {
                Id = 3,
                ArticleTypeId = 3,
                CreatedAt = new DateTimeOffset(new DateTime(2022, 09, 17)),
                CreatedBy = 1,
                LongDescription = "Other Long Description string",
                PlayedOnGamingPlatformId = null,
                PlayTime = null,
                Producer = null,
                ShortDescription = "Other Short Description string",
                Title = "Other Title string"
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

        await db.ArticleGamingPlatforms.InsertAsync(
            () => new ArticleGamingPlatform
            {
                ArticleId = 2,
                GamingPlatformId = 3
            }
        );
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
        var response = await _suite.Client.Request("article", "1").
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
                        Name = "Michał Kubrak",
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
        var response = await _suite.Client.Request("article", "2").
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
                        Name = "Michał Kubrak",
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
        var response = await _suite.Client.Request("article", "3").
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
                        Name = "Michał Kubrak",
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
        var response = await _suite.Client.AllowHttpStatus(HttpStatusCode.NotFound).
                                    Request("article", "4").
                                    GetAsync();

        response.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
    }
}
