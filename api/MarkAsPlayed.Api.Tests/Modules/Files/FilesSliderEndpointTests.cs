using FluentAssertions;
using Flurl.Http;
using LinqToDB;
using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Modules.Files.Models;

namespace MarkAsPlayed.Api.Tests.Modules.Files;

public sealed class FilesSliderFixture : IntegrationTest
{
    protected override async Task SetUp()
    {
        await using var db = CreateDatabase();

        for (int i = 1; i < 11; i++)
        {
            await db.Articles.InsertAsync(
                () => new Data.Models.Article
                {
                    Id = i,
                    ArticleTypeId = 3,
                    CreatedAt = new DateTimeOffset(new DateTime(2022, i, 17)),
                    CreatedBy = 1,
                    ShortDescription = "Other Short Description string",
                    Title = "Other Title string"
                }
            );

            await db.ArticlesContent.InsertAsync(
                () => new ArticleContent
                {
                    ArticleId = i,
                    LongDescription = "Other Long Description string"
                }
            );
        }
    }
}

public class FilesSliderEndpointTests : IClassFixture<FilesSliderFixture>
{
    private readonly FilesSliderFixture _suite;

    public FilesSliderEndpointTests(FilesSliderFixture suite)
    {
        _suite = suite;
    }

    [Fact]
    public async Task ShouldRetrieveSliderUrls()
    {
        var response = await _suite.Client.Request("files", "slider").GetAsync();

        var jsonSerializedResponse = await response.GetJsonAsync<IEnumerable<SliderData>>();

        jsonSerializedResponse.Should().HaveCount(5);

        for (long i = 6; i < 11; i++)
        {
            var check = jsonSerializedResponse.FirstOrDefault(slide => slide.ImagePathName == $"http://localhost/Image/{i}/Main.webp");
            check.Should().NotBeNull();
        }
    }
}
