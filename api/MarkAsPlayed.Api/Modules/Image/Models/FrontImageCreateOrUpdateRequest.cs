using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Image.Models;

public class FrontImageCreateOrUpdateRequest
{
    [Required]
    public string Id { get; init; } = default!;

    [Required]
    public IFormFile File { get; init; } = default!;
}