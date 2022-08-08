using LinqToDB.Mapping;

namespace MarkAsPlayed.Api.Data.Models;

[Table("article_image")]
public class ArticleImage
{
    [Column("article_image_id")]
    [PrimaryKey]
    [NotNull]
    [Identity]
    public long Id { get; set; }

    [Column("file_name")]
    [NotNull]
    public string FileName { get; set; } = default!;

    [Column("article_id")]
    [NotNull]
    public long ArticleId { get; set; }

    [Column("is_active")]
    [NotNull]
    public bool IsActive { get; set; }
}
