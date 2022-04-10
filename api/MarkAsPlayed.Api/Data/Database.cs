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
    public ITable<ArticleGamingPlatform> ArticleGamingPlatforms => this.GetTable<ArticleGamingPlatform>();
    public ITable<GamingPlatform> GamingPlatforms => this.GetTable<GamingPlatform>();
    public ITable<Genre> Genres => this.GetTable<Genre>();
    public ITable<ArticleGallery> ArticleGallery => this.GetTable<ArticleGallery>();
    public ITable<Author> Authors => this.GetTable<Author>();
}
