using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using MarkAsPlayed.Api.Modules.Article.Core.Queries;
using MarkAsPlayed.Api.Modules.Article.Core.Models;
using MarkAsPlayed.Api.Modules.Article.Core.Commands;

namespace MarkAsPlayed.Api.Modules.Article.Core;

[ApiController]
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
    [ProducesResponseType(typeof(IReadOnlyList<DashboardArticleData>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetArticleListingAsync(
        [Range(1, int.MaxValue)]
        int? page)
    {
        var listing = await _articleQuery.GetListingAsync(page ?? 1, HttpContext.RequestAborted);

        Response.Headers.Add("display-page", listing.Page.ToString());
        Response.Headers.Add("articles-count", listing.Total.ToString());

        return Ok(listing.Data);
    }

    /// <summary>
    ///     Retrieves an article by id
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(FullArticleData), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetArticleAsync(
        [Range(1, int.MaxValue)]
        int id)
    {
        var article = await _articleQuery.GetSingleArticleAsync(id, HttpContext.RequestAborted);

        if (article is null)
        {
            return NotFound();
        }

        return Ok(article);
    }

    /// <summary>
    ///     Creates an article
    /// </summary>
    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(long), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateArticleAsync(
        [FromBody]
        ArticleRequestData request)
    {
        var userId = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier) ?? null;
        if (userId is null)
        {
            return NotFound();
        }

        var response = await _articleCommand.CreateAsync(request, userId.Value, HttpContext.RequestAborted);

        return response.Status switch
        {
            StatusCodesHelper.NotFound => NotFound(),
            StatusCodesHelper.InternalError => Problem(
                statusCode: 500, 
                title: "Failed to create article"
                ),
            _ => Ok(response.ArticleIdentifier)
        };
    }

    /// <summary>
    ///     Updates an article
    /// </summary>
    [Authorize]
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateArticleAsync(
        [FromBody]
        ArticleRequestData request,
        int id)
    {
        var response = await _articleCommand.UpdateAsync(id, request, HttpContext.RequestAborted);

        return response.Status switch
        {
            StatusCodesHelper.NotFound => NotFound(),
            StatusCodesHelper.InternalError => Problem(
                statusCode: 500,
                title: $"Failed to update {response.ArticleIdentifier} article"
                ),
            _ => NoContent()
        };
    }
}