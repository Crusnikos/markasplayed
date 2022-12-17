using MarkAsPlayed.Api.Modules.Article.Tags.Commands;
using MarkAsPlayed.Api.Modules.Article.Tags.Models;
using MarkAsPlayed.Api.Modules.Article.Tags.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Article.Tags;

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
    ///     Retrieves tags by id
    /// </summary>
    [HttpGet("article/{id}")]
    public async Task<ActionResult> GetTagsByIdAsync(
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
    public async Task<IActionResult> CreateTagAsync(
        [FromBody]
        TagRequestData request)
    {
        var response = await _tagCommand.CreateAsync(request, HttpContext.RequestAborted);

        return response.Status switch
        {
            TagStatus.InternalError =>
                throw new Exception("Failed to create tag", response.ExceptionCaptured),
            _ => Ok()
        };
    }

    /// <summary>
    ///     Deactivate a tag
    /// </summary>
    [Authorize]
    [HttpPut]
    public async Task<IActionResult> DeactivateTagAsync(
        [FromBody]
        TagRequestData request)
    {
        var response = await _tagCommand.DeactivateAsync(request, HttpContext.RequestAborted);

        return response.Status switch
        {
            TagStatus.Forbidden => Forbid("No tags updated"),
            TagStatus.InternalError =>
                throw new Exception("Failed to create tag", response.ExceptionCaptured),
            _ => Ok()
        };
    }
}
