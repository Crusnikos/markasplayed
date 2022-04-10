using LinqToDB.Mapping;

namespace MarkAsPlayed.Api.Data.Models;

[Table("article_gaming_platform")]
public class ArticleGamingPlatform
{
    [Column("article_id")]
    [PrimaryKey]
    [NotNull]
    public long ArticleId { get; set; }

    [Column("gaming_platform_id")]
    [PrimaryKey]
    [NotNull]
    public int GamingPlatformId { get; set; }
}
