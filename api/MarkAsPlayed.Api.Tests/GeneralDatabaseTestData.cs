using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Modules;

namespace MarkAsPlayed.Api.Tests;

public class GeneralDatabaseTestData
{
    public Article ReviewArticleExample;
    public Article NewsArticleExample;
    public Article OtherArticleExample;

    public GeneralDatabaseTestData()
    {
        ReviewArticleExample = CreateReviewArticleExample();
        NewsArticleExample = CreateNewsArticleExample();
        OtherArticleExample = CreateOtherArticleExample();
    }

    private Article CreateReviewArticleExample()
    {
        return new Article
        {
            ArticleTypeId = (int)ArticleTypeHelper.review,
            CreatedAt = new DateTimeOffset(new DateTime(2022, 09, 19)),
            CreatedBy = 1,
            ShortDescription = "Review Short Description string",
            Title = "Review Title string"
        };
    }

    private Article CreateNewsArticleExample()
    {
        return new Article
        {
            ArticleTypeId = (int)ArticleTypeHelper.news,
            CreatedAt = new DateTimeOffset(new DateTime(2022, 09, 18)),
            CreatedBy = 1,
            ShortDescription = "News Short Description string",
            Title = "News Title string"
        };
    }

    private Article CreateOtherArticleExample()
    {
        return new Article
        {
            ArticleTypeId = (int)ArticleTypeHelper.other,
            CreatedAt = new DateTimeOffset(new DateTime(2022, 09, 17)),
            CreatedBy = 1,
            ShortDescription = "Other Short Description string",
            Title = "Other Title string"
        };
    }

    public ArticleReviewData CreateArticleReviewData(long id)
    {
        return new ArticleReviewData
        {
            ArticleId = id,
            PlayedOnGamingPlatformId = 1,
            PlayTime = 15,
            Producer = "Review Producer string"
        };
    }

    public ArticleContent CreateArticleContentData(ArticleTypeHelper type, long id)
    {
        var description = "";
        switch (type)
        {
            case ArticleTypeHelper.review:
                description = "Review Long Description string";
                break;
            case ArticleTypeHelper.news:
                description = "News Long Description string";
                break;
            case ArticleTypeHelper.other:
                description = "Other Long Description string";
                break;
            default:
                break;
        }

        return new ArticleContent
        {
            ArticleId = id,
            LongDescription = description
        };
    }
}
