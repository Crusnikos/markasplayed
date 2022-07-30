namespace MarkAsPlayed.Api.Lookups;

public static class LookupConfiguration
{
    public static void ConfigureModule(IServiceCollection services)
    {
        services.AddScoped(typeof(LookupQuery<>), typeof(LookupQuery<>));
    }
}
