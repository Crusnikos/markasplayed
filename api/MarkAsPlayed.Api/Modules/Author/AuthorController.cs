using Microsoft.AspNetCore.Mvc;
using MarkAsPlayed.Api.Modules.Author.Queries;
using MarkAsPlayed.Api.Modules.Author.Models;
using MarkAsPlayed.Api.Modules.Article.Core.Models;

namespace MarkAsPlayed.Api.Modules.Author;

[ApiController]
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
    [HttpGet("listing")]
    [ProducesResponseType(typeof(IReadOnlyList<AuthorData>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuthorsListing()
    {
        var listing = await _authorQuery.GetAuthors(HttpContext.RequestAborted);

        return Ok(listing);
    }
}
