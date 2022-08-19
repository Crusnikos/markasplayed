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
    [HttpGet("listing")]
    public async Task<IEnumerable<DashboardArticleData>> GetArticleListingAsync(
        [Range(1, int.MaxValue)]
        int? page)
    {
        var listing = await _articleQuery.GetListingAsync(page ?? 1, HttpContext.RequestAborted);

        Response.Headers.Add("display-page", listing.Page.ToString());
        Response.Headers.Add("articles-count", listing.Total.ToString());

        return listing.Data;
    }

    /// <summary>
    ///     Retrieves an article by id
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetArticleAsync(
        [Range(1, int.MaxValue)]
        int id)
    {
        var article = await _articleQuery.GetSingleArticleAsync(id, HttpContext.RequestAborted);

        if(article is null)
        {
            return NotFound();
        }

        return Ok(article);
    }

    /// <summary>
    ///     Creates an article
    /// </summary>
    [Authorize]
    public async Task<IActionResult> CreateArticleAsync(
        [FromBody]
        ArticleRequestData request)
    {
        var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier) ?? null;
        if(userId is null)
        {
            return NotFound(userId);
        }

        var response = await _articleCommand.CreateAsync(request, userId.Value, HttpContext.RequestAborted);

        return response.Status switch
        {
            ArticleStatus.NotFound => NotFound("Author not found"),
            ArticleStatus.InternalError => 
                throw new Exception("Failed to create article", response.ExceptionCaptured),
            _ => Ok(response.Identifier)
        };
    }

    /// <summary>
    ///     Updates an article
    /// </summary>
    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateArticleAsync(
        [FromBody]
        ArticleRequestData request,
        int id)
    {
        var response = await _articleCommand.UpdateAsync(id, request, HttpContext.RequestAborted);

        return response.Status switch
        {
            ArticleStatus.Forbidden => Forbid("No articles updated"),
            ArticleStatus.InternalError => 
                throw new Exception($"Failed to update {response.Identifier} article", response.ExceptionCaptured),
            _ => NoContent()
        };
    }
}