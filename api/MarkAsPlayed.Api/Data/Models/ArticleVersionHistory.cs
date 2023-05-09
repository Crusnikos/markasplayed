using LinqToDB;
using LinqToDB.Mapping;

namespace MarkAsPlayed.Api.Data.Models;

[Table("article_version_history")]
public class ArticleVersionHistory
{
    [Column("article_id")]
    [PrimaryKey]
    [NotNull]
    public long ArticleId { get; set; }

    [Column("transaction_id")]
    [NotNull]
    public string TransactionId { get; set; } = default!;

    [Column("created_at")]
    [NotNull]
    public DateTimeOffset CreatedAt { get; set; }

    [Column("created_by_author_id")]
    [NotNull]
    public int CreatedBy { get; set; }

    [Column("differences", DataType = DataType.BinaryJson)]
    [NotNull]
    public string Differences { get; set; } = default!;
}
