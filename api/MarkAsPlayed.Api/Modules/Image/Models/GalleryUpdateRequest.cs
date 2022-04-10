namespace MarkAsPlayed.Api.Modules.Image.Models;

public class GalleryUpdateRequest
{
    public IReadOnlyList<int> GalleryIds { get; init; } = default!;
}
