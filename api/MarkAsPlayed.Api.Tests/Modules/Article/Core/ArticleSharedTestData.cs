using MarkAsPlayed.Api.Modules;
using MarkAsPlayed.Api.Modules.Article.Core.Models;

namespace MarkAsPlayed.Api.Tests.Modules.Article.Core;

public class ArticleSharedTestData
{
    public class MalformedArticleData : TheoryData<ArticleRequestData, string, string>
    {
        public MalformedArticleData()
        {
            Add(
                new ArticleRequestData
                {
                    Title = new string('A', 300),
                    PlayedOn = 1,
                    AvailableOn = new List<int> { 1, 2, 3 },
                    Producer = "Example Producer",
                    PlayTime = 123,
                    ShortDescription = "Example Short Description",
                    LongDescription = "Example Long Description",
                    ArticleType = (int)ArticleTypeHelper.review
                },
                nameof(ArticleRequestData.Title),
                "*maximum length of*"
            );

            Add(
                new ArticleRequestData
                {
                    PlayedOn = 1,
                    AvailableOn = new List<int> { 1, 2, 3 },
                    Producer = "Example Producer",
                    PlayTime = 123,
                    ShortDescription = "Example Short Description",
                    LongDescription = "Example Long Description",
                    ArticleType = (int)ArticleTypeHelper.review
                },
                nameof(ArticleRequestData.Title),
                "*required*"
            );

            Add(
                new ArticleRequestData
                {
                    Title = "Example Title",
                    PlayedOn = 1,
                    AvailableOn = new List<int> { 1, 2, 3 },
                    Producer = new string('A', 300),
                    PlayTime = 123,
                    ShortDescription = "Example Short Description",
                    LongDescription = "Example Long Description",
                    ArticleType = (int)ArticleTypeHelper.review
                },
                nameof(ArticleRequestData.Producer),
                "*maximum length of*"
            );

            Add(
                new ArticleRequestData
                {
                    Title = "Example Title",
                    PlayedOn = 1,
                    AvailableOn = new List<int> { 1, 2, 3 },
                    Producer = "Example Producer",
                    PlayTime = 1001,
                    ShortDescription = "Example Short Description",
                    LongDescription = "Example Long Description",
                    ArticleType = (int)ArticleTypeHelper.review
                },
                nameof(ArticleRequestData.PlayTime),
                "*must be between*"
            );

            Add(
                new ArticleRequestData
                {
                    Title = "Example Title",
                    PlayedOn = 1,
                    AvailableOn = new List<int> { 1, 2, 3 },
                    Producer = "Example Producer",
                    PlayTime = 123,
                    LongDescription = "Example Long Description",
                    ArticleType = (int)ArticleTypeHelper.review
                },
                nameof(ArticleRequestData.ShortDescription),
                "*required*"
            );

            Add(
                new ArticleRequestData
                {
                    Title = "Example Title",
                    PlayedOn = 1,
                    AvailableOn = new List<int> { 1, 2, 3 },
                    Producer = "Example Producer",
                    PlayTime = 123,
                    ShortDescription = new string('A', 500),
                    LongDescription = "Example Long Description",
                    ArticleType = (int)ArticleTypeHelper.review
                },
                nameof(ArticleRequestData.ShortDescription),
                "*maximum length of*"
            );

            Add(
                new ArticleRequestData
                {
                    Title = "Example Title",
                    PlayedOn = 1,
                    AvailableOn = new List<int> { 1, 2, 3 },
                    Producer = "Example Producer",
                    PlayTime = 123,
                    ShortDescription = "Example Short Description",
                    ArticleType = (int)ArticleTypeHelper.review
                },
                nameof(ArticleRequestData.LongDescription),
                "*required*"
            );

            Add(
                new ArticleRequestData
                {
                    Title = "Example Title",
                    PlayedOn = 1,
                    AvailableOn = new List<int> { 1, 2, 3 },
                    Producer = "Example Producer",
                    PlayTime = 123,
                    ShortDescription = "Example Short Description",
                    LongDescription = new string('A', 10001),
                    ArticleType = (int)ArticleTypeHelper.review
                },
                nameof(ArticleRequestData.LongDescription),
                "*maximum length of*"
            );
        }
    }

    public class InvalidReferenceArticleData : TheoryData<ArticleRequestData>
    {
        public InvalidReferenceArticleData()
        {
            Add(
                new ArticleRequestData
                {
                    Title = "Example Title",
                    PlayedOn = 100,
                    AvailableOn = new List<int> { 1, 2, 3, 100 },
                    Producer = "Example Producer",
                    PlayTime = 123,
                    ShortDescription = "Example Short Description",
                    LongDescription = "Example Long Description",
                    ArticleType = (int)ArticleTypeHelper.review
                }
            );

            Add(
                new ArticleRequestData
                {
                    Title = "Example Title",
                    PlayedOn = 1,
                    AvailableOn = new List<int> { 1, 2, 300 },
                    Producer = "Example Producer",
                    PlayTime = 123,
                    ShortDescription = "Example Short Description",
                    LongDescription = "Example Long Description",
                    ArticleType = (int)ArticleTypeHelper.review
                }
            );

            Add(
                new ArticleRequestData
                {
                    Title = "Example Title",
                    PlayedOn = 1,
                    AvailableOn = new List<int> { 1, 2, 3 },
                    Producer = "Example Producer",
                    PlayTime = 123,
                    ShortDescription = "Example Short Description",
                    LongDescription = "Example Long Description",
                    ArticleType = 1000
                }
            );

            Add(
                new ArticleRequestData
                {
                    Title = "Example Title",
                    PlayedOn = 1,
                    AvailableOn = new List<int> { 1, 2, 3 },
                    Producer = "Example Producer",
                    PlayTime = 123,
                    ShortDescription = "Example Short Description",
                    LongDescription = "Example Long Description",
                    ArticleType = 0
                }
            );
        }
    }

    public class InvalidArticleDataId : TheoryData<ArticleRequestData>
    {
        public InvalidArticleDataId()
        {
            Add(
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
        }
    }

    public class InvalidUnprocessableEntity : TheoryData<ArticleRequestData>
    {
        public InvalidUnprocessableEntity()
        {
            Add(
                new ArticleRequestData
                {
                    Title = "Example Title",
                    PlayedOn = 1,
                    AvailableOn = new List<int> { 2, 3 },
                    Producer = "Example Producer",
                    PlayTime = 123,
                    ShortDescription = "Example Short Description",
                    LongDescription = "Example Long Description",
                    ArticleType = (int)ArticleTypeHelper.review
                }
            );
        }
    }
}
