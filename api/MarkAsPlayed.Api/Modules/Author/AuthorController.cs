using Microsoft.AspNetCore.Mvc;
using MarkAsPlayed.Api.Modules.Author.Queries;
using MarkAsPlayed.Api.Modules.Author.Models;

namespace MarkAsPlayed.Api.Modules.Author;

[Route("author")]
public sealed class AuthorController : ControllerBase
{
    private readonly AuthorQuery _authorQuery;

    public AuthorController(AuthorQuery authorQuery)
    {
        _authorQuery = authorQuery;
    }

    /// <summary>
    ///     Retrieves an authors listing
    /// </summary>
    [HttpGet]
    [Route("listing")]
    public async Task<IEnumerable<AuthorData>> GetArticleListingAsync()
    {
        return await _authorQuery.GetAuthorsListing(HttpContext.RequestAborted);
    }
}
