﻿using FluentAssertions;
using Flurl.Http;
using LinqToDB;
using MarkAsPlayed.Api.Modules.Files.Models;

namespace MarkAsPlayed.Api.Tests.Modules.Files;

public sealed class FilesGalleryFixture : IntegrationTest
{
    protected override async Task SetUp()
    {
        await using var db = CreateDatabase();

        await db.Articles.InsertAsync(
            () => new Data.Models.Article
            {
                Id = 1,
                ArticleTypeId = 3,
                CreatedAt = new DateTimeOffset(new DateTime(2022, 1, 17)),
                CreatedBy = 1,
                LongDescription = "Other Long Description string",
                PlayedOnGamingPlatformId = null,
                PlayTime = null,
                Producer = null,
                ShortDescription = "Other Short Description string",
                Title = "Other Title string"
            }
        );

        await db.ArticleImages.InsertAsync(
            () => new Data.Models.ArticleImage
            {
                Id = 1,
                ArticleId = 1,
                FileName = "a0efbcc8-0d59-4c88-8322-9f031cf5bbde.webp",
                IsActive = true
            }
        );

        await db.ArticleImages.InsertAsync(
            () => new Data.Models.ArticleImage
            {
                Id = 2,
                ArticleId = 1,
                FileName = "014091ba-afbd-4213-af63-bfb63d64957a.webp",
                IsActive = true
            }
        );

        await db.ArticleImages.InsertAsync(
            () => new Data.Models.ArticleImage
            {
                Id = 3,
                ArticleId = 1,
                FileName = "658c4ad9-7c79-4458-8049-94e8d4159bf0.webp",
                IsActive = true
            }
        );

        await db.ArticleImages.InsertAsync(
            () => new Data.Models.ArticleImage
            {
                Id = 4,
                ArticleId = 1,
                FileName = "ba080168-16f9-4c26-b9f4-fc0d6e1ac2cb.webp",
                IsActive = false
            }
        );
    }
}

public class FilesGalleryEndpointTests : IClassFixture<FilesGalleryFixture>
{
    private readonly FilesGalleryFixture _suite;

    public FilesGalleryEndpointTests(FilesGalleryFixture suite)
    {
        _suite = suite;
    }

    [Fact]
    public async Task ShouldRetrieveEmptyGalleryList()
    {
        var response = await _suite.Client.Request("files", "article", "2", "gallery").GetAsync();

        var jsonSerializedResponse = await response.GetJsonAsync<IEnumerable<SliderData>>();

        jsonSerializedResponse.Should().HaveCount(0);
    }

    [Fact]
    public async Task ShouldRetrieveGalleryList()
    {
        var response = await _suite.Client.Request("files", "article", "1", "gallery").GetAsync();

        var jsonSerializedResponse = await response.GetJsonAsync<IEnumerable<SliderData>>();

        jsonSerializedResponse.Should().HaveCount(3);
    }
}
