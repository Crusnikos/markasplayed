using LinqToDB.Mapping;

namespace MarkAsPlayed.Api.Data.Models;

[Table("gaming_platform")]
public sealed class GamingPlatform : LookupItem
{
    [Column("gaming_platform_id")]
    public override int Id { get; set; }
}
