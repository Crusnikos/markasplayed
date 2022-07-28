using LinqToDB;
using MarkAsPlayed.Api.Data;
using MarkAsPlayed.Api.Data.Models;
using MarkAsPlayed.Api.Modules.Article.Models;

namespace MarkAsPlayed.Api.Modules.Article.Commands;

public sealed class ArticleCommand
{
    private readonly Database.Factory _databaseFactory;

    public ArticleCommand(Database.Factory databaseFactory)
    {
        _databaseFactory = databaseFactory;
    }

    public async Task<long> CreateOrUpdateArticle(
        ArticleCreateOrUpdateRequestData request,
        string authorOfRequest,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();
        var resultId = (long)0;

        try
        {
            await using var transaction = await db.BeginTransactionAsync(cancellationToken);

            if (!(request.Id is null) && db.Articles.Any(a => a.Id == request.Id))
            {
                var oldArticleData = await db.Articles.Where(a => a.Id == request.Id).FirstOrDefaultAsync(cancellationToken);
                var malformedLongDescription = request.LongDescription.Trim();
                var malformedShortDescription = request.ShortDescription.Trim();

                await db.Articles.Where(a => a.Id == request.Id).
                    Set(a => a.CreatedAt, oldArticleData!.CreatedAt).
                    Set(a => a.GamingPlatformId, request.PlayedOn).
                    Set(a => a.GenreId, request.Genre).
                    Set(a => a.LongDescription, malformedLongDescription).
                    Set(a => a.ShortDescription, malformedShortDescription).
                    Set(a => a.PlayTime, request.PlayTime).
                    Set(a => a.Producer, request.Producer).
                    Set(a => a.Title, request.Title).
                    Set(a => a.CreatedBy, oldArticleData!.CreatedBy).
                    UpdateAsync(cancellationToken);

                await db.ArticleGamingPlatforms.DeleteAsync(p => p.ArticleId == request.Id, cancellationToken);

                var platforms = request.AvailableOn ?? Enumerable.Empty<int>();

                foreach (var platform in platforms.Distinct())
                {
                    await db.ArticleGamingPlatforms.InsertAsync(
                        () => new ArticleGamingPlatform
                        {
                            ArticleId = (long)request.Id!,
                            GamingPlatformId = platform
                        },
                        cancellationToken
                    );
                }

                resultId = oldArticleData.Id;
            }
            else
            {
                var author = await db.Authors.Where(a => a.FirebaseId == authorOfRequest).FirstOrDefaultAsync(cancellationToken);

                if(author is null)
                {
                    throw new ArgumentNullException(nameof(author));
                }

                var malformedLongDescription = request.LongDescription.Trim();
                var malformedShortDescription = request.ShortDescription.Trim();

                var identifier = await db.Articles.InsertWithInt64IdentityAsync(
                    () => new Data.Models.Article
                    {
                        Title = request.Title,
                        Producer = request.Producer,
                        PlayTime = request.PlayTime,
                        LongDescription = malformedLongDescription,
                        ShortDescription = malformedShortDescription,
                        GamingPlatformId = request.PlayedOn,
                        GenreId = request.Genre,
                        CreatedBy = author.Id
                    },
                    cancellationToken
                );

                var platforms = request.AvailableOn ?? Enumerable.Empty<int>();

                foreach (var platform in platforms.Distinct())
                {
                    await db.ArticleGamingPlatforms.InsertAsync(
                        () => new ArticleGamingPlatform
                        {
                            ArticleId = identifier,
                            GamingPlatformId = platform
                        },
                        cancellationToken
                    );
                }

                resultId = identifier;
            }

            await transaction.CommitAsync(cancellationToken);

            return resultId;
        }
        catch (Exception)
        {
            return resultId;
        }
    }
}
