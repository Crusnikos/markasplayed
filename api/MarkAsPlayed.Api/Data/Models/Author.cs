using LinqToDB.Mapping;

namespace MarkAsPlayed.Api.Data.Models;

[Table("author")]
public class Author
{
    [Column("author_id")]
    [NotNull]
    [PrimaryKey]
    [Identity]
    public int Id { get; set; }

    [Column("firebase_id")]
    [NotNull]
    public string FirebaseId { get; set; } = default!;

    [Column("name")]
    [NotNull]
    public string Name { get; set; } = default!;

    [Column("description_pl")]
    [NotNull]
    public string DescriptionPl { get; set; } = default!;

    [Column("description_en")]
    [NotNull]
    public string DescriptionEn { get; set; } = default!;
}
