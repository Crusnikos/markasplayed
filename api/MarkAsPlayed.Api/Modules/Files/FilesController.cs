using MarkAsPlayed.Api.Modules.Files.Commands;
using MarkAsPlayed.Api.Modules.Files.Models;
using MarkAsPlayed.Api.Modules.Files.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Files;

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
    public async Task<IEnumerable<ImageData>> GetSliderImagesAsync()
    {
        var baseUri = new Uri($"{HttpContext.Request.Scheme}://{HttpContext.Request.Host.Value}/");

        return await _filesQuery.GetSliderAsync(baseUri, HttpContext.RequestAborted);
    }

    /// <summary>
    ///     Retrieves an image by id
    /// </summary>
    [HttpGet("article/{id}/front")]
    public async Task<ActionResult> GetFrontImageByIdAsync(
        [Range(1, int.MaxValue)]
        int id,
        Size size = Size.Large)
    {
        var baseUri = new Uri($"{HttpContext.Request.Scheme}://{HttpContext.Request.Host.Value}/");

        var image = await _filesQuery.GetFrontImageAsync(id, baseUri, size);

        if(image is null)
        {
            return NotFound();
        }

        return Ok(image);
    }

    /// <summary>
    ///     Update front image
    /// </summary>
    [Authorize]
    [HttpPut("article/{id}/front")]
    public async Task<IActionResult> UpdateFrontImageByIdAsync([FromForm] FrontImageRequestData request, int id)
    {
        await _filesCommand.UpdateFrontImageAsync(
                request.File,
                Path.Combine(_env.ContentRootPath, "Image", id.ToString()),
                HttpContext.RequestAborted);

        return NoContent();
    }

    /// <summary>
    ///     Retrieves a article gallery
    /// </summary>
    [HttpGet("article/{id}/gallery")]
    public async Task<IEnumerable<ImageData>> GetArticleGalleryAsync(
        [Range(1, int.MaxValue)]
        int id)
    {
        var baseUri = new Uri($"{HttpContext.Request.Scheme}://{HttpContext.Request.Host.Value}/");

        return await _filesQuery.GetGalleryAsync(id, baseUri, HttpContext.RequestAborted);
    }

    /// <summary>
    ///     Update gallery
    /// </summary>
    [Authorize]
    [HttpPut("article/{id}/gallery")]
    public async Task<IActionResult> UpdateExistingGalleryAsync([FromBody] GalleryUpdateRequest request, int id)
    {
        await _filesCommand.UpdateGalleryAsync(request.GalleryIds, HttpContext.RequestAborted);

        return Ok(id);
    }

    /// <summary>
    ///     Add images to gallery
    /// </summary>
    [Authorize]
    [HttpPost("article/{id}/gallery")]
    public async Task<IActionResult> AddToGalleryAsync([FromForm] GalleryAddRequest request, int id)
    {
        var uploadedFiles = await _filesCommand.AddToGalleryAsync(
                request.Files, 
                Path.Combine(_env.ContentRootPath, "Image", id.ToString(), "Gallery"),
                id,
                HttpContext.RequestAborted);

        return uploadedFiles switch
        {
            true => NoContent(),
            false => Conflict(),
            _ => BadRequest()
        };
    }

    /// <summary>
    ///     Retrieves an author image
    /// </summary>
    [HttpGet]
    [Route("author/{id}/avatar")]
    public async Task<ImageData?> GetAuthorImageByIdAsync(
        [Range(1, int.MaxValue)]
        int id)
    {
        var baseUri = new Uri($"{HttpContext.Request.Scheme}://{HttpContext.Request.Host.Value}/");
        var image = await _filesQuery.GetAuthorImageAsync(id, baseUri);

        return image;
    }
}
