using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;

namespace MarkAsPlayed.Api.Modules.Image;

public sealed class CreateMiniature
{
    private string LocalMiniaturePath;

    public CreateMiniature(string LocalMiniaturePath)
    {
        this.LocalMiniaturePath = LocalMiniaturePath;
    }

    public void CreateMiniatureMethod()
    {
        using var image = SixLabors.ImageSharp.Image.Load(LocalMiniaturePath);

        if (image.Width / 16 == image.Height / 9)
        {
            image.Mutate(x => x.Resize(640, 360));
            image.Save(LocalMiniaturePath);
        }
        else
        {
            var widthMultiplier = image.Width / 16;
            var heightMultiplier = image.Height / 9;

            if(widthMultiplier >= heightMultiplier)
            {
                var width = heightMultiplier * 16;
                var height = heightMultiplier * 9;

                image.Mutate(x => x.Crop(new Rectangle(0, 0, width, height)).Resize(640, 360));
                image.Save(LocalMiniaturePath);
            }
            else
            {
                var width = widthMultiplier * 16;
                var height = widthMultiplier * 9;

                image.Mutate(x => x.Crop(new Rectangle(0, 0, width, height)).Resize(640, 360));
                image.Save(LocalMiniaturePath);
            }
        }
    }
}
