using MarkAsPlayed.Api.Modules.Article.Tags.Models;

namespace MarkAsPlayed.Api.Tests.Modules.Article.Tags;

public class TagSharedTestData
{
    public class MalformedTagData : TheoryData<TagRequestData, string, string>
    {
        public MalformedTagData()
        {
            Add(
                new TagRequestData
                {
                    TagId = 1
                },
                nameof(TagRequestData.ArticleId),
                "*must be between*"
            );
            Add(
                new TagRequestData
                {
                    ArticleId = 1
                },
                nameof(TagRequestData.TagId),
                "*must be between*"
            );
        }
    }

    public class InvalidReferenceTagData : TheoryData<TagRequestData>
    {
        public InvalidReferenceTagData()
        {
            Add(
                new TagRequestData
                {
                    ArticleId = 1000,
                    TagId = 1
                }
            );

            Add(
                new TagRequestData
                {
                    ArticleId = 1,
                    TagId = 1000
                }
            );
        }
    }
}
