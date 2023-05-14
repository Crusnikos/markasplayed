using MarkAsPlayed.Api.Data;
using MarkAsPlayed.Api.Modules.Article.Core.Models;
using MarkAsPlayed.Api.Modules.Article.Tags.Models;

namespace MarkAsPlayed.Api.Modules.Article;

public interface IArticleHelper
{
    Task<long> InsertArticleAsync(Database database, ArticleRequestData request, int authorId, CancellationToken cancellationToken);
    Task InsertArticleContentAsync(Database database, ArticleRequestData request, long identifier, CancellationToken cancellationToken);
    Task InsertArticleStatisticsAsync(Database database, long identifier, CancellationToken cancellationToken);
    Task InsertArticleReviewDataAsync(Database database, ArticleRequestData request, long identifier, CancellationToken cancellationToken);
    Task InsertArticleGamingPlatformAsync(Database database, long identifier, int platform, CancellationToken cancellationToken);
    Task<int> UpdateArticleAsync(Database database, ArticleRequestData request, Data.Models.Article oldArticleData, int articleId, CancellationToken cancellationToken);
    Task UpdateArticleContentAsync(Database database, ArticleRequestData request, int articleId, CancellationToken cancellationToken);
    Task<int> UpdateArticleReviewDataAsync(Database database, ArticleRequestData request, int articleId, CancellationToken cancellationToken);
    IList<PlatformData> GetPlatformsList(Database database, long? articleId = null);
    Task InsertArticleTagAsync(Database database, TagRequestData request, CancellationToken cancellationToken = default);
    Task<int> UpdateArticleTagAsync(Database database, TagRequestData request, bool isActive, CancellationToken cancellationToken = default);
}
