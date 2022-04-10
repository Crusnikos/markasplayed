using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using MarkAsPlayed.Api.Modules.Article.Queries;
using MarkAsPlayed.Api.Modules.Article.Models;
using MarkAsPlayed.Api.Modules.Article.Commands;

namespace MarkAsPlayed.Api.Modules.Article;

[Route("article")]
public sealed class ArticleController : ControllerBase
{
    private readonly ArticleQuery _articleQuery;
    private readonly ArticleCommand _articleCommand;

    public ArticleController(ArticleQuery articleQuery, ArticleCommand articleCommand)
    {
        _articleQuery = articleQuery;
        _articleCommand = articleCommand;
    }

    /// <summary>
    ///     Retrieves an articles listing
    /// </summary>
    [HttpGet]
    [Route("listing")]
    public async Task<IEnumerable<DashboardArticleData>> GetArticleListingAsync(
        [Range(1, int.MaxValue)]
        int? page)
    {
        var listing = await _articleQuery.GetArticleListing(page ?? 1, HttpContext.RequestAborted);

        Response.Headers.Add("display-page", listing.Page.ToString());
        Response.Headers.Add("articles-count", listing.Total.ToString());

        return listing.Data;
    }

    /// <summary>
    ///     Retrieves an article by id
    /// </summary>
    [HttpGet]
    public async Task<FullArticleData> GetArticleByIdAsync(
        [Range(1, int.MaxValue)]
        int id)
    {
        var article = await _articleQuery.GetArticleById(id, HttpContext.RequestAborted);

        return article;
    }

    /// <summary>
    ///     Retrieves an article lookup table
    /// </summary>
    [HttpGet]
    [Route("lookup")]
    public async Task<IEnumerable<LookupData>> GetArticleLookupTableAsync(string lookupName)
    {
        var lookup = await _articleQuery.GetArticleLookupTable(lookupName, HttpContext.RequestAborted);

        return lookup;
    }

    /// <summary>
    ///     Creates or updates an article
    /// </summary>
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateOrUpdateArticleAsync(
        [FromBody]
        ArticleCreateOrUpdateRequestData request)
    {
        var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier) ?? null;
        if(userId is null)
        {
            return NotFound(userId);
        }

        var id = await _articleCommand.CreateOrUpdateArticle(request, userId.Value, HttpContext.RequestAborted);
        if(id == 0)
        {
            return StatusCode(500);
        }

        return Ok(id);
    }
}