using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Article.Tags.Models;

public class TagData
{
    [Required]
    public int? Id { get; init; }

    [Required]
    public string Name { get; init; } = default!;

    [Required]
    public char GroupName { get; init; }
}
