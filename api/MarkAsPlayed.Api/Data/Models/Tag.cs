using LinqToDB.Mapping;

namespace MarkAsPlayed.Api.Data.Models;

[Table("tag")]
public sealed class Tag : LookupItem
{
    [Column("tag_id")]
    public override int Id { get; set; }
}
