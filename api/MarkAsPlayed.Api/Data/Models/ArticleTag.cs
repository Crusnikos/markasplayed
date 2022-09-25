using LinqToDB.Mapping;

namespace MarkAsPlayed.Api.Data.Models;

[Table("article_tag")]
public class ArticleTag
{
    [Column("article_id")]
    [PrimaryKey]
    [NotNull]
    public long ArticleId { get; set; }

    [Column("tag_id")]
    [PrimaryKey]
    [NotNull]
    public int TagId { get; set; }

    [Column("is_active")]
    [NotNull]
    public bool IsActive { get; set; }
}
