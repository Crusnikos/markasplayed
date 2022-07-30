using LinqToDB.Mapping;

namespace MarkAsPlayed.Api.Data.Models;

[Table("article_type")]
public class ArticleType : LookupItem
{
    [Column("article_type_id")]
    public override int Id { get; set; }
}
