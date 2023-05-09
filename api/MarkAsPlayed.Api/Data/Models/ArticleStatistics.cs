using LinqToDB.Mapping;

namespace MarkAsPlayed.Api.Data.Models;

[Table("article_statistics")]
public class ArticleStatistics
{
    [Column("article_id")]
    [PrimaryKey]
    [NotNull]
    public long ArticleId { get; set; }
}
