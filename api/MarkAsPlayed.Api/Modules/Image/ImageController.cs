using MarkAsPlayed.Api.Modules.Image.Commands;
using MarkAsPlayed.Api.Modules.Image.Models;
using MarkAsPlayed.Api.Modules.Image.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Image;

[Route("image")]
public sealed class ImageController : ControllerBase
{
    private readonly ImageQuery _imageQuery;
    private readonly ImageCommand _imageCommand;
    private readonly IWebHostEnvironment _env;

    public ImageController(
        ImageQuery imageQuery,
        ImageCommand imageCommand,
        IWebHostEnvironment env)
    {
        _imageQuery = imageQuery;
        _env = env;
        _imageCommand = imageCommand;
    }

    /// <summary>
    ///     Retrieves an image by id
    /// </summary>
    [HttpGet]
    [Route("front")]
    public async Task<ImageData> GetFrontImageByIdAsync(
        [Range(1, int.MaxValue)]
        int id,
        bool small = false)
    {
        var image = 
            await _imageQuery.GetFrontImageById(
                id,
                HttpContext.Request.Scheme,
                HttpContext.Request.Host.Value,
                small
            );

        return image;
    }

    /// <summary>
    ///     Retrieves latest slider images
    /// </summary>
    [HttpGet]
    [Route("slider")]
    public async Task<IEnumerable<ImageData>> GetSliderImagesAsync()
    {
        return await _imageQuery.GetSliderImages(
            HttpContext.Request.Scheme, 
            HttpContext.Request.Host.Value,
            HttpContext.RequestAborted);
    }

    /// <summary>
    ///     Retrieves a article gallery
    /// </summary>
    [HttpGet]
    [Route("gallery")]
    public async Task<IEnumerable<ImageData>> GetArticleGalleryAsync(
        [Range(1, int.MaxValue)]
        int id)
    {
        return await _imageQuery.GetArticleGallery(
            id,
            HttpContext.Request.Scheme,
            HttpContext.Request.Host.Value,
            HttpContext.RequestAborted);
    }

    /// <summary>
    ///     Update front image
    /// </summary>
    [Authorize]
    [HttpPost]
    [Route("front/update")]
    public async Task<IActionResult> UpdateFrontImageAsync([FromForm] FrontImageCreateOrUpdateRequest request)
    {
        await _imageCommand.UpdateFrontImage(
                request.File, 
                Path.Combine(_env.ContentRootPath, "Image", request.Id), 
                HttpContext.RequestAborted);

        return Ok(request.Id);
    }

    /// <summary>
    ///     Update gallery
    /// </summary>
    [Authorize]
    [HttpPost]
    [Route("gallery/update")]
    public async Task<IActionResult> UpdateGalleryAsync([FromBody] GalleryUpdateRequest request)
    {
        await _imageCommand.UpdateExistingGalleryImages(request.GalleryIds, HttpContext.RequestAborted);

        return Ok();
    }

    /// <summary>
    ///     Add images to gallery
    /// </summary>
    [Authorize]
    [HttpPost]
    [Route("gallery/add")]
    public async Task<IActionResult> AddToGalleryAsync([FromForm] GalleryAddRequest request)
    {
        await _imageCommand.AddNewGalleryImages(
                request.Files, 
                Path.Combine(_env.ContentRootPath, "Image", request.Id, "Gallery"),
                Int32.Parse(request.Id),
                HttpContext.RequestAborted);

        return Ok();
    }

    /// <summary>
    ///     Retrieves an author image
    /// </summary>
    [HttpGet]
    [Route("author")]
    public async Task<ImageData> GetAuthorImageAsync(
        [Range(1, int.MaxValue)]
        int id)
    {
        var image =
            await _imageQuery.GetAuthorImage(
                id,
                HttpContext.Request.Scheme,
                HttpContext.Request.Host.Value
            );

        return image;
    }
}
