using LinqToDB;
using MarkAsPlayed.Api.Data;
using MarkAsPlayed.Api.Modules.Article.Tags.Models;

namespace MarkAsPlayed.Api.Modules.Article.Tags.Queries;

public class TagQuery
{
    private readonly Database.Factory _databaseFactory;

    public TagQuery(Database.Factory databaseFactory)
    {
        _databaseFactory = databaseFactory;
    }

    public async Task<IEnumerable<TagData>> GetSingleArticleTagsAsync(
        int articleId,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();

        var listing =
            await (from articleTags in db.ArticleTags.Where(at => 
                at.ArticleId == articleId && 
                at.IsActive == true)
            from tags in db.Tags.LeftJoin(t => t.Id == articleTags.TagId)
            select new TagData
            {
                Id = tags.Id,
                Name = tags.Name,
                GroupName = tags.GroupName
            }).ToListAsync(cancellationToken);

        return listing;
    }
}
