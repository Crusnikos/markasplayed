using MarkAsPlayed.Api.Data.Models;
using Microsoft.AspNetCore.Mvc;

namespace MarkAsPlayed.Api.Lookups;

public abstract class LookupController<T> : ControllerBase where T : LookupItem
{
    private readonly LookupQuery<T> _query;

    protected LookupController(LookupQuery<T> query)
    {
        _query = query;
    }

    /// <summary>
    ///     Retrieves the specified lookup data listing
    /// </summary>
    [HttpGet]
    public async Task<IEnumerable<LookupData>> GetLookupTable()
    {
        var data = await _query.GetLookupTable(HttpContext.RequestAborted);

        return data;
    }
}
