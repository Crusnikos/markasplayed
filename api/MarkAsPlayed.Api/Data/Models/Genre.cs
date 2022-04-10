using LinqToDB.Mapping;

namespace MarkAsPlayed.Api.Data.Models;

[Table("genre")]
public class Genre
{
    [Column("genre_id")]
    [NotNull]
    [PrimaryKey]
    [Identity]
    public int Id { get; set; }

    [Column("genre_name")]
    [NotNull]
    public string Name { get; set; } = default!;
}
