using LinqToDB.Mapping;

namespace MarkAsPlayed.Api.Data.Models;

[Table("article")]
public sealed class Article
{
    [Column("article_id")]
    [PrimaryKey]
    [NotNull]
    [Identity]
    public long Id { get; set; }

    [Column("title")]
    [NotNull]
    public string Title { get; set; } = default!;

    [Column("played_on")]
    public int? GamingPlatformId { get; set; }

    [Column("producer")]
    public string? Producer { get; set; }

    [Column("play_time")]
    public int? PlayTime { get; set; }

    [Column("genre_id")]
    [NotNull]
    public int GenreId { get; set; }

    [Column("created_at")]
    [NotNull]
    public DateTimeOffset CreatedAt { get; set; }

    [Column("short_description")]
    [NotNull]
    public string ShortDescription { get; set; } = default!;

    [Column("long_description")]
    [NotNull]
    public string LongDescription { get; set; } = default!;

    [Column("created_by")]
    [NotNull]
    public int CreatedBy { get; set; }
}
