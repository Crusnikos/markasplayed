using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Files.Models;

/// <summary>
///     Image informations
/// </summary>
public class ImageData
{
    /// <summary>
    ///     Image id
    /// </summary>
    [Required]
    public long Id { get; set; }

    /// <summary>
    ///     Image file name
    /// </summary>
    [Required]
    public string ImageFileName { get; set; } = default!;

    /// <summary>
    ///     Image server route
    /// </summary>
    [Required]
    public string ImagePathName { get; set; } = default!;
}
