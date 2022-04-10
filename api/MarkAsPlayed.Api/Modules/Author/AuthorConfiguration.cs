using MarkAsPlayed.Api.Modules.Author.Queries;

namespace MarkAsPlayed.Api.Modules.Author;

public static class AuthorConfiguration
{
    public static void ConfigureModule(IServiceCollection services)
    {
        services.AddScoped<AuthorQuery>();
    }
}
