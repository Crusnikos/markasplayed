using System.ComponentModel.DataAnnotations;

namespace MarkAsPlayed.Api.Lookups;

public class LookupData
{
    [Required]
    public int? Id { get; init; }

    [Required]
    public string Name { get; init; } = default!;

    [Required]
    public char GroupName { get; init; } = default!;
}
