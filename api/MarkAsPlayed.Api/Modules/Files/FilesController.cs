using MarkAsPlayed.Api.Modules.Files.Commands;
using MarkAsPlayed.Api.Modules.Files.Models;
using MarkAsPlayed.Api.Modules.Files.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Files;

[ApiController]
[Route("files")]
public sealed class FilesController : ControllerBase
{
    private readonly FilesQuery _filesQuery;
    private readonly FilesCommand _filesCommand;
    private readonly IWebHostEnvironment _env;

    public FilesController(
        FilesQuery filesQuery,
        FilesCommand filesCommand,
        IWebHostEnvironment env)
    {
        _filesQuery = filesQuery;
        _env = env;
        _filesCommand = filesCommand;
    }

    /// <summary>
    ///     Retrieves latest slider images
    /// </summary>
    [HttpGet("slider")]
    [ProducesResponseType(typeof(IReadOnlyList<SliderData>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSliderImagesAsync()
    {
        var baseUri = new Uri($"{HttpContext.Request.Scheme}://{HttpContext.Request.Host.Value}/");
        var response = await _filesQuery.GetSliderAsync(baseUri, HttpContext.RequestAborted);

        return Ok(response);
    }

    /// <summary>
    ///     Retrieves an image by id
    /// </summary>
    [HttpGet("article/{id}/front")]
    [ProducesResponseType(typeof(ImageData), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetFrontImageAsync(
        [Range(1, int.MaxValue)]
        int id,
        Size size = Size.Large)
    {
        var baseUri = new Uri($"{HttpContext.Request.Scheme}://{HttpContext.Request.Host.Value}/");

        var response = await _filesQuery.GetFrontImageAsync(id, baseUri, size);

        if(response is null)
        {
            return NotFound();
        }

        return Ok(response);
    }

    /// <summary>
    ///     Update front image
    /// </summary>
    [Authorize]
    [HttpPost("article/{id}/front")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateFrontImageAsync([FromForm] FrontImageRequestData request, int id)
    {
        var response = await _filesCommand.CreateFrontImageAsync(
                request.File,
                Path.Combine(_env.ContentRootPath, "Image", id.ToString()),
                HttpContext.RequestAborted);

        return response.Status switch
        {
            StatusCodesHelper.BadRequest => BadRequest(),
            StatusCodesHelper.InternalError => Problem(
                statusCode: 500,
                title: "Failed to update front image"
                ),
            _ => NoContent()
        };
    }

    /// <summary>
    ///     Retrieves a article gallery
    /// </summary>
    [HttpGet("article/{id}/gallery")]
    [ProducesResponseType(typeof(IReadOnlyList<SliderData>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetArticleGalleryAsync(
        [Range(1, int.MaxValue)]
        int id)
    {
        var response = await _filesQuery.GetGalleryAsync(
                id, 
                new Uri($"{HttpContext.Request.Scheme}://{HttpContext.Request.Host.Value}/"), 
                HttpContext.RequestAborted
                );

        return Ok(response);
    }

    /// <summary>
    ///     Update gallery image
    /// </summary>
    [Authorize]
    [HttpPut("article/{id}/gallery")]
    [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateGalleryAsync([FromBody] GalleryUpdateRequest request, int id)
    {
        var response = await _filesCommand.UpdateGalleryAsync(request.Id, id, HttpContext.RequestAborted);

        return response.Status switch
        {
            StatusCodesHelper.NotFound => NotFound(),
            StatusCodesHelper.InternalError => Problem(
                statusCode: 500,
                title: "Failed to update gallery image"
                ),
            _ => Ok(id)
        };
    }

    /// <summary>
    ///     Add image to gallery
    /// </summary>
    [Authorize]
    [HttpPost("article/{id}/gallery")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> AddToGalleryAsync([FromForm] GalleryAddRequest request, int id)
    {
        var response = await _filesCommand.AddToGalleryAsync(
                request.File, 
                Path.Combine(_env.ContentRootPath, "Image", id.ToString(), "Gallery"),
                id,
                HttpContext.RequestAborted);

        return response.Status switch
        {
            StatusCodesHelper.InternalError => Problem(
                statusCode: 500,
                title: "Failed add image to gallery"
                ),
            _ => NoContent()
        };
    }

    /// <summary>
    ///     Retrieves an author image
    /// </summary>
    [HttpGet]
    [Route("author/{id}/avatar")]
    [ProducesResponseType(typeof(ImageData), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAuthorImageByIdAsync(
        [Range(1, int.MaxValue)]
        int id)
    {
        var response = await _filesQuery.GetAuthorImageAsync(
            id,
            new Uri($"{HttpContext.Request.Scheme}://{HttpContext.Request.Host.Value}/")
            );

        if (response is null)
        {
            return NotFound();
        }

        return Ok(response);
    }
}
