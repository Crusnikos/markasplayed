using MarkAsPlayed.Api.Modules.Article.Tags.Commands;
using MarkAsPlayed.Api.Modules.Article.Tags.Models;
using MarkAsPlayed.Api.Modules.Article.Tags.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Article.Tags;

[ApiController]
[Route("tags")]
public sealed class TagController : ControllerBase
{
    private readonly TagQuery _tagQuery;
    private readonly TagCommand _tagCommand;

    public TagController(TagQuery tagQuery, TagCommand tagCommand)
    {
        _tagQuery = tagQuery;
        _tagCommand = tagCommand;
    }

    /// <summary>
    ///     Retrieves tags by article id
    /// </summary>
    [HttpGet("article/{id}")]
    [ProducesResponseType(typeof(IReadOnlyList<TagData>), StatusCodes.Status200OK)]
    public async Task<ActionResult> GetTagsAsync(
        [Range(1, int.MaxValue)]
        int id)
    {
        var data = await _tagQuery.GetSingleArticleTagsAsync(id, HttpContext.RequestAborted);

        return Ok(data);
    }

    /// <summary>
    ///     Creates a tag
    /// </summary>
    [Authorize]
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateTagAsync(
        [FromBody]
        TagRequestData request)
    {
        var response = await _tagCommand.CreateAsync(request, HttpContext.RequestAborted);

        return response.Status switch
        {
            StatusCodesHelper.NotFound => NotFound(),
            StatusCodesHelper.InternalError => Problem(
                statusCode: 500,
                title: $"Failed to create tag: {response.TagIdentifier} for article: {response.ArticleIdentifier}"
                ),
            _ => NoContent()
        };
    }

    /// <summary>
    ///     Deactivate a tag
    /// </summary>
    [Authorize]
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeactivateTagAsync(
        [FromBody]
        TagRequestData request)
    {
        var response = await _tagCommand.DeactivateAsync(request, HttpContext.RequestAborted);

        return response.Status switch
        {
            StatusCodesHelper.NotFound => NotFound(),
            StatusCodesHelper.InternalError => Problem(
                statusCode: 500,
                title: $"Failed to deactivate tag: {response.TagIdentifier} for article: {response.ArticleIdentifier}"
                ),
            _ => NoContent()
        };
    }
}
