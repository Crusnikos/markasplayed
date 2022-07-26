using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace MarkAsPlayed.Api.Modules.Image;

public class Resolution
{
    public int Width { get; set; }
    public int Height { get; set; }
}

public sealed class ImageResolution
{
    private string _filePath;

    public static Resolution ResolutionNHD = new() { Width = 640, Height = 360 };
    public static Resolution ResolutionHD = new() { Width = 1280, Height = 720 };
    public static Resolution ResolutionFullHD = new() { Width = 1920, Height = 1080 };

    public ImageResolution(string filePath)
    {
        _filePath = filePath;
    }

    public async Task ConfigureFileResolution(Resolution type, CancellationToken cancellationToken)
    {
        using var image = await SixLabors.ImageSharp.Image.LoadAsync(_filePath, cancellationToken);

        if(image is null)
        {
            throw new ImageProcessingException(nameof(_filePath));
        }

        if (image.Width != type.Width || image.Height != type.Height)
        {
            if (image.Width / 16 == image.Height / 9)
            {
                image.Mutate(x => x.Resize(type.Width, type.Height));
                await image.SaveAsync(_filePath, cancellationToken);
            }
            else
            {
                var widthMultiplier = image.Width / 16;
                var heightMultiplier = image.Height / 9;

                if (widthMultiplier >= heightMultiplier)
                {
                    var width = heightMultiplier * 16;
                    var height = heightMultiplier * 9;

                    image.Mutate(x =>
                        x.Crop(new Rectangle(0, 0, width, height)).
                        Resize(type.Width, type.Height));

                    await image.SaveAsync(_filePath, cancellationToken);
                }
                else
                {
                    var width = widthMultiplier * 16;
                    var height = widthMultiplier * 9;

                    image.Mutate(x =>
                        x.Crop(new Rectangle(0, 0, width, height)).
                        Resize(type.Width, type.Height));

                    await image.SaveAsync(_filePath, cancellationToken);

                }
            }
        }
    }
}
