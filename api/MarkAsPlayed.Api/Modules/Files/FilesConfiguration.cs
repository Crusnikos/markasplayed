using MarkAsPlayed.Api.Modules.Files.Commands;
using MarkAsPlayed.Api.Modules.Files.Queries;

namespace MarkAsPlayed.Api.Modules.Files;

public static class FilesConfiguration
{
    public static void ConfigureModule(IServiceCollection services)
    {
        services.AddScoped<FilesQuery>();
        services.AddScoped<FilesCommand>();
    }
}
