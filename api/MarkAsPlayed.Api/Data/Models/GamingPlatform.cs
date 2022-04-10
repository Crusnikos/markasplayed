using LinqToDB.Mapping;

namespace MarkAsPlayed.Api.Data.Models;

[Table("gaming_platform")]
public sealed class GamingPlatform
{
    [Column("gaming_platform_id")]
    [NotNull]
    [PrimaryKey]
    [Identity]
    public int Id { get; set; }

    [Column("gaming_platform_name")]
    [NotNull]
    public string Name { get; set; } = default!;
}
