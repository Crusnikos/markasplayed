using MarkAsPlayed.Api.Modules.Article.Core.Queries;
using MarkAsPlayed.Api.Modules.Article.Core.Commands;
using MarkAsPlayed.Api.Modules.Article.Tags.Queries;
using MarkAsPlayed.Api.Modules.Article.Tags.Commands;

namespace MarkAsPlayed.Api.Modules.Article;

public static class ArticleConfiguration
{
    public static void ConfigureModule(IServiceCollection services)
    {
        services.AddScoped<ArticleQuery>();
        services.AddScoped<ArticleCommand>();
        services.AddScoped<TagQuery>();
        services.AddScoped<TagCommand>();
        services.AddScoped<IArticleHelper, ArticleHelper>();
    }
}
