using LinqToDB.Mapping;

namespace MarkAsPlayed.Api.Data.Models;

[Table("tag")]
public class Tag
{
    [Column("tag_id")]
    [NotNull]
    [PrimaryKey]
    [Identity]
    public int Id { get; set; }

    [Column("name")]
    [NotNull]
    public string Name { get; set; } = default!;

    [Column("group_name")]
    [NotNull]
    public char Group { get; set; }
}
