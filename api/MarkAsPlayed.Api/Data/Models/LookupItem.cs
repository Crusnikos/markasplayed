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

    [Column("group_name")]
    [NotNull]
    public char GroupName { get; set; } = default!;
}
