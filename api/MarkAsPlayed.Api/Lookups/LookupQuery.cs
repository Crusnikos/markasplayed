using MarkAsPlayed.Api.Data;
using MarkAsPlayed.Api.Data.Models;
using LinqToDB;

namespace MarkAsPlayed.Api.Lookups;

public class LookupQuery<T> where T : LookupItem
{
    private readonly Database.Factory _databaseFactory;

    public LookupQuery(Database.Factory databaseFactory)
    {
        _databaseFactory = databaseFactory;
    }

    public async Task<List<LookupData>> GetLookupTable(CancellationToken cancellationToken = default)
    {
        await using var db = _databaseFactory();

        return await db.GetTable<T>().
            Select(lookupData => 
                new LookupData
                {
                    Id = lookupData.Id,
                    Name = lookupData.Name
                }).ToListAsync(cancellationToken);
    }
}
