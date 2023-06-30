using MarkAsPlayed.Api.Data;
using MarkAsPlayed.Api.Modules.Article.Core.Models;
using MarkAsPlayed.Api.Modules.Article.Tags.Models;

namespace MarkAsPlayed.Api.Modules.Article;

public interface IArticleHelper
{
    Task<long> InsertArticleAsync(Database database, ArticleFoundationData request, int authorId, CancellationToken cancellationToken);
    Task InsertArticleContentAsync(Database database, ArticleFoundationData request, long identifier, CancellationToken cancellationToken);
    Task InsertArticleStatisticsAsync(Database database, long identifier, CancellationToken cancellationToken);
    Task InsertArticleReviewDataAsync(Database database, ArticleFoundationData request, long identifier, CancellationToken cancellationToken);
    Task InsertArticleGamingPlatformAsync(Database database, long identifier, int platform, CancellationToken cancellationToken);
    Task InsertArticleTagAsync(Database database, TagRequestData request, CancellationToken cancellationToken = default);
    Task InsertArticleHistoryRecord(Database database, long id, List<Variance> variances, string requestor, string transactionId, DateTimeOffset? createdAt, CancellationToken cancellationToken);
    Task<int> UpdateArticleAsync(Database database, ArticleFoundationData request, long articleId, CancellationToken cancellationToken);
    Task UpdateArticleContentAsync(Database database, ArticleFoundationData request, long articleId, CancellationToken cancellationToken);
    Task<int> UpdateArticleReviewDataAsync(Database database, ArticleFoundationData request, long articleId, CancellationToken cancellationToken);
    Task<int> UpdateArticleTagAsync(Database database, TagRequestData request, bool isActive, CancellationToken cancellationToken = default);
    ArticleFoundationData GetArticleFoundationData(Database database, long? articleId = null);
    IList<PlatformData> GetPlatformsList(Database database, long? articleId = null);
}
