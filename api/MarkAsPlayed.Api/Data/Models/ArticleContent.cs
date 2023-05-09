using LinqToDB.Mapping;

namespace MarkAsPlayed.Api.Data.Models;

[Table("article_content")]
public class ArticleContent
{
    [Column("article_id")]
    [PrimaryKey]
    [NotNull]
    public long ArticleId { get; set; }

    [Column("long_description")]
    [NotNull]
    public string LongDescription { get; set; } = default!;
}
