using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Author.Models;

/// <summary>
///     Author informations
/// </summary>
public class AuthorData
{
    /// <summary>
    ///     Author Id
    /// </summary>
    [Required]
    public int Id { get; set; }

    /// <summary>
    ///     Author name
    /// </summary>
    [Required]
    public string Name { get; set; } = default!;

    /// <summary>
    ///     Information about the author in Polish
    /// </summary>
    [Required]
    public string DescriptionPl { get; set; } = default!;

    /// <summary>
    ///     Information about the author in English
    /// </summary>
    [Required]
    public string DescriptionEn { get; set; } = default!;
}
