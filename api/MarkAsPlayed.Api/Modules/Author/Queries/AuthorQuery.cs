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

    public List<AuthorData> GetAuthors()
    {
        using var db = _databaseFactory();

        return db.Authors.Select(
            q => new AuthorData
            {
                Id = q.Id,
                Name = q.Name,
                DescriptionPl = q.DescriptionPl,
                DescriptionEn = q.DescriptionEn
            }).
            OrderByDescending(q => q.Id).
            ToList();
    }
}
