using LinqToDB.Mapping;

namespace MarkAsPlayed.Api.Data.Models;

[Table("article_gallery")]
public class ArticleGallery
{
    [Column("image_id")]
    [PrimaryKey]
    [NotNull]
    [Identity]
    public long Id { get; set; }

    [Column("image_filename")]
    [NotNull]
    public string Filename { get; set; } = default!;

    [Column("article_id")]
    [NotNull]
    public long ArticleId { get; set; }

    [Column("is_active")]
    [NotNull]
    public bool IsActive { get; set; }
}
