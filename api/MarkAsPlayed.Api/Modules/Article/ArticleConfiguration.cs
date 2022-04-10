using MarkAsPlayed.Api.Modules.Article.Queries;
using MarkAsPlayed.Api.Modules.Article.Commands;

namespace MarkAsPlayed.Api.Modules.Article;

public static class ArticleConfiguration
{
    public static void ConfigureModule(IServiceCollection services)
    {
        services.AddScoped<ArticleQuery>();
        services.AddScoped<ArticleCommand>();
    }
}
