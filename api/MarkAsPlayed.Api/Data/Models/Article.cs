using LinqToDB.Mapping;

namespace MarkAsPlayed.Api.Data.Models;

[Table("article")]
public class Article
{
    [Column("article_id")]
    [PrimaryKey]
    [NotNull]
    [Identity]
    public long Id { get; set; }

    [Column("title")]
    [NotNull]
    public string Title { get; set; } = default!;

    [Column("created_at")]
    [NotNull]
    public DateTimeOffset CreatedAt { get; set; }

    [Column("created_by_author_id")]
    [NotNull]
    public int CreatedBy { get; set; }

    [Column("article_type_id")]
    [NotNull]
    public int ArticleTypeId { get; set; }

    [Column("short_description")]
    [NotNull]
    public string ShortDescription { get; set; } = default!;
}
