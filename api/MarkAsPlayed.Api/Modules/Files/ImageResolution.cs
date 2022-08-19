using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace MarkAsPlayed.Api.Modules.Files;

public sealed record Resolution(int Width, int Height)
{
    public static Resolution NHD { get; } = new(640, 360);
    public static Resolution HD { get; } = new(1280, 720);
    public static Resolution FullHD { get; } = new(1920, 1080);
}

public sealed class ImageResolution
{
    private string _filePathName;

    public ImageResolution(string filePathName)
    {
        _filePathName = filePathName;
    }

    public async Task OverwriteFileResolution(Resolution resolution, CancellationToken cancellationToken)
    {
        using var image = await SixLabors.ImageSharp.Image.LoadAsync(_filePathName, cancellationToken);

        if(image is null)
        {
            throw new ImageProcessingException(nameof(_filePathName));
        }

        if (image.Width != resolution.Width || image.Height != resolution.Height)
        {
            if (image.Width / 16 == image.Height / 9)
            {
                using var resized = MutateImageResolution(
                    resolution, 
                    image
                    );
                await resized.SaveAsync(_filePathName, cancellationToken);
            }
            else
            {
                var widthMultiplier = image.Width / 16;
                var heightMultiplier = image.Height / 9;

                using var resized = MutateImageResolution(
                    resolution, 
                    image, 
                    widthMultiplier >= heightMultiplier ? heightMultiplier : widthMultiplier
                    );
                await resized.SaveAsync(_filePathName, cancellationToken);
            }
        }
    }

    private Image MutateImageResolution(Resolution resolution, Image image, int? multiplier = null)
    {
        if(multiplier is null)
        {
            image.Mutate(x => x.Resize(resolution.Width, resolution.Height));
            return image;
        }

        var width = (int)(multiplier * 16);
        var height = (int)(multiplier * 9);

        image.Mutate(x =>
            x.Crop(new Rectangle(0, 0, width, height)).
            Resize(resolution.Width, resolution.Height));

        return image;
    }
}
