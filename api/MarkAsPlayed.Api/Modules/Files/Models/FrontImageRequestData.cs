using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Files.Models;

/// <summary>
///     Front image change request
/// </summary>
public class FrontImageRequestData
{
    /// <summary>
    ///     Front image file
    /// </summary>
    [Required]
    public IFormFile File { get; init; } = default!;
}