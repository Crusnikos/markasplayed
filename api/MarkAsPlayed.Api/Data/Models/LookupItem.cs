using LinqToDB.Mapping;

namespace MarkAsPlayed.Api.Data.Models;

public abstract class LookupItem
{
    [NotNull]
    [PrimaryKey]
    [Identity]
    public abstract int Id { get; set; }

    [Column("name")]
    [NotNull]
    public string Name { get; set; } = default!;
}
