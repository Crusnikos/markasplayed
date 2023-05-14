using LinqToDB.Mapping;

namespace MarkAsPlayed.Api.Data.Models;

[Table("article_review_data")]
public class ArticleReviewData
{
    [Column("article_id")]
    [PrimaryKey]
    [NotNull]
    public long ArticleId { get; set; }

    [Column("played_on_gaming_platform_id")]
    [NotNull]
    public int PlayedOnGamingPlatformId { get; set; }

    [Column("producer")]
    [NotNull]
    public string Producer { get; set; } = default!;

    [Column("play_time")]
    [NotNull]
    public int PlayTime { get; set; }
}
