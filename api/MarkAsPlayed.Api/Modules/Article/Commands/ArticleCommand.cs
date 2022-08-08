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

    public async Task<long> CreateAsync(
        ArticleRequestData request,
        string authorOfRequest,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();

        try
        {
            await using var transaction = await db.BeginTransactionAsync(cancellationToken);

            var author = await db.Authors.Where(a => a.FirebaseId == authorOfRequest).FirstOrDefaultAsync(cancellationToken);

            if (author is null)
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
                    PlayedOnGamingPlatformId = request.PlayedOn,
                    ArticleTypeId = request.ArticleType,
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

            await transaction.CommitAsync(cancellationToken);

            return identifier;
        } 
        catch (Exception)
        {
            throw new Exception("Failed to create article");
        }
    }

    public async Task<bool> UpdateAsync(
        int id,
        ArticleRequestData request,
        CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();

        if (!db.Articles.Any(a => a.Id == id))
        {
            return false;
        }

        try
        {
            await using var transaction = await db.BeginTransactionAsync(cancellationToken);

            var oldArticleData = await db.Articles.Where(a => a.Id == id).FirstOrDefaultAsync(cancellationToken);
            var malformedLongDescription = request.LongDescription.Trim();
            var malformedShortDescription = request.ShortDescription.Trim();

            await db.Articles.Where(a => a.Id == id).
                Set(a => a.CreatedAt, oldArticleData!.CreatedAt).
                Set(a => a.PlayedOnGamingPlatformId, request.PlayedOn).
                Set(a => a.ArticleTypeId, request.ArticleType).
                Set(a => a.LongDescription, malformedLongDescription).
                Set(a => a.ShortDescription, malformedShortDescription).
                Set(a => a.PlayTime, request.PlayTime).
                Set(a => a.Producer, request.Producer).
                Set(a => a.Title, request.Title).
                Set(a => a.CreatedBy, oldArticleData!.CreatedBy).
                UpdateAsync(cancellationToken);

            await db.ArticleGamingPlatforms.DeleteAsync(p => p.ArticleId == id, cancellationToken);

            var platforms = request.AvailableOn ?? Enumerable.Empty<int>();

            foreach (var platform in platforms.Distinct())
            {
                await db.ArticleGamingPlatforms.InsertAsync(
                    () => new ArticleGamingPlatform
                    {
                        ArticleId = (long)id!,
                        GamingPlatformId = platform
                    },
                    cancellationToken
                );
            }

            await transaction.CommitAsync(cancellationToken);

            return true;
        }
        catch (Exception)
        {
            throw new Exception($"Failed to update id:{id} article");
        }
    }
}
