using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Author.Models;

public class AuthorData
{
    [Required]
    public int Id { get; set; }

    [Required]
    public string Name { get; set; } = default!;

    [Required]
    public string DescriptionPl { get; set; } = default!;

    [Required]
    public string DescriptionEn { get; set; } = default!;
}
