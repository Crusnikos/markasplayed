using MarkAsPlayed.Api.Modules.Image.Commands;
using MarkAsPlayed.Api.Modules.Image.Queries;

namespace MarkAsPlayed.Api.Modules.Image;

public static class ImageConfiguration
{
    public static void ConfigureModule(IServiceCollection services)
    {
        services.AddScoped<ImageQuery>();
        services.AddScoped<ImageCommand>();
    }
}
