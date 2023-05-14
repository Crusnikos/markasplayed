using LinqToDB;
using LinqToDB.Data;
using MarkAsPlayed.Api.Data.Models;

namespace MarkAsPlayed.Api.Data;
public sealed class Database : DataConnection
{
    public delegate Database Factory();

    public Database(string connectionString) : base(
        ProviderName.PostgreSQL95,
        connectionString
    )
    {
    }

    public ITable<Article> Articles => this.GetTable<Article>();
    public ITable<ArticleReviewData> ArticlesReviewData => this.GetTable<ArticleReviewData>();
    public ITable<ArticleContent> ArticlesContent => this.GetTable<ArticleContent>();
    public ITable<ArticleStatistics> ArticlesStatistics => this.GetTable<ArticleStatistics>();
    public ITable<ArticleGamingPlatform> ArticleGamingPlatforms => this.GetTable<ArticleGamingPlatform>();
    public ITable<ArticleType> ArticleTypes => this.GetTable<ArticleType>();
    public ITable<ArticleImage> ArticleImages => this.GetTable<ArticleImage>();
    public ITable<ArticleTag> ArticleTags => this.GetTable<ArticleTag>();
    public ITable<GamingPlatform> GamingPlatforms => this.GetTable<GamingPlatform>();
    public ITable<Author> Authors => this.GetTable<Author>();
    public ITable<Tag> Tags => this.GetTable<Tag>();
}
