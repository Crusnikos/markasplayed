using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Modules.Article.Models;

public class LookupData
{
    [Required]
    public int? Id { get; init; }

    [Required]
    public string Name { get; init; } = default!;
}
