using MarkAsPlayed.Api.Modules;
using MarkAsPlayed.Api.Modules.Article.Core.Models;

namespace MarkAsPlayed.Api.Tests.Modules.Article.Core;

public class ArticleSharedTestData
{
    public class MalformedArticleData : TheoryData<ArticleFoundationData, string, string>
    {
        public MalformedArticleData()
        {
            Add(
                new ArticleFoundationData
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
                nameof(ArticleFoundationData.Title),
                "*maximum length of*"
            );

            Add(
                new ArticleFoundationData
                {
                    PlayedOn = 1,
                    AvailableOn = new List<int> { 1, 2, 3 },
                    Producer = "Example Producer",
                    PlayTime = 123,
                    ShortDescription = "Example Short Description",
                    LongDescription = "Example Long Description",
                    ArticleType = (int)ArticleTypeHelper.review
                },
                nameof(ArticleFoundationData.Title),
                "*required*"
            );

            Add(
                new ArticleFoundationData
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
                nameof(ArticleFoundationData.Producer),
                "*maximum length of*"
            );

            Add(
                new ArticleFoundationData
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
                nameof(ArticleFoundationData.PlayTime),
                "*must be between*"
            );

            Add(
                new ArticleFoundationData
                {
                    Title = "Example Title",
                    PlayedOn = 1,
                    AvailableOn = new List<int> { 1, 2, 3 },
                    Producer = "Example Producer",
                    PlayTime = 123,
                    LongDescription = "Example Long Description",
                    ArticleType = (int)ArticleTypeHelper.review
                },
                nameof(ArticleFoundationData.ShortDescription),
                "*required*"
            );

            Add(
                new ArticleFoundationData
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
                nameof(ArticleFoundationData.ShortDescription),
                "*maximum length of*"
            );

            Add(
                new ArticleFoundationData
                {
                    Title = "Example Title",
                    PlayedOn = 1,
                    AvailableOn = new List<int> { 1, 2, 3 },
                    Producer = "Example Producer",
                    PlayTime = 123,
                    ShortDescription = "Example Short Description",
                    ArticleType = (int)ArticleTypeHelper.review
                },
                nameof(ArticleFoundationData.LongDescription),
                "*required*"
            );

            Add(
                new ArticleFoundationData
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
                nameof(ArticleFoundationData.LongDescription),
                "*maximum length of*"
            );
        }
    }

    public class InvalidReferenceArticleData : TheoryData<ArticleFoundationData>
    {
        public InvalidReferenceArticleData()
        {
            Add(
                new ArticleFoundationData
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
                new ArticleFoundationData
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
                new ArticleFoundationData
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
                new ArticleFoundationData
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

    public class InvalidArticleDataId : TheoryData<ArticleFoundationData>
    {
        public InvalidArticleDataId()
        {
            Add(
                new ArticleFoundationData
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

    public class InvalidUnprocessableEntity : TheoryData<ArticleFoundationData>
    {
        public InvalidUnprocessableEntity()
        {
            Add(
                new ArticleFoundationData
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
