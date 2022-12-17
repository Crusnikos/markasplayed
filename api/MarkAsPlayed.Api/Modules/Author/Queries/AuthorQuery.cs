using MarkAsPlayed.Api.Data;
using MarkAsPlayed.Api.Modules.Author.Models;
using LinqToDB;

namespace MarkAsPlayed.Api.Modules.Author.Queries;

public sealed class AuthorQuery
{
    private readonly Database.Factory _databaseFactory;

    public AuthorQuery(Database.Factory databaseFactory)
    {
        _databaseFactory = databaseFactory;
    }

    public async Task<List<AuthorData>> GetAuthors(CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();

        return await db.Authors.Select(
            q => new AuthorData
            {
                Id = q.Id,
                Name = q.Name,
                DescriptionPl = q.DescriptionPl,
                DescriptionEn = q.DescriptionEn
            }).
            OrderByDescending(q => q.Id).
            ToListAsync(cancellationToken);
    }
}
