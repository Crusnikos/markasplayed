using Flurl.Http;
using Flurl.Http.Configuration;
using MarkAsPlayed.Api.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json;
using System.Net.Http.Headers;

namespace MarkAsPlayed.Api.Tests;

public class IntegrationTest : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly TestConfiguration _configuration;

    public IntegrationTest()
    {
        _configuration = TestConfiguration.Create();
    }

    public FlurlClient Client { get; private set; } = default!;

    public async Task InitializeAsync()
    {
        await _configuration.SetUpTestDatabaseAsync();
        await SetUp();
        var client = Server.CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(TestAuthenticationHandler.DefaultScheme, "token");

        var jsonSetting = new JsonSerializerSettings { };

        Client = new FlurlClient(client)
        {
            Settings = { JsonSerializer = new NewtonsoftJsonSerializer(jsonSetting) }
        };
    }

    protected virtual void ConfigureServices(IServiceCollection services)
    {
        services.AddAuthentication(TestAuthenticationHandler.DefaultScheme)
                .AddScheme<AuthenticationSchemeOptions, TestAuthenticationHandler>
                (
                    TestAuthenticationHandler.DefaultScheme,_ => { }
                );
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseTestServer().
                UseEnvironment("Test").
                ConfigureTestServices(ConfigureServices);
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        builder.ConfigureHostConfiguration(cfg =>
        {
            cfg.AddConfiguration(_configuration.Value);
        });
        return base.CreateHost(builder);
    }

    async Task IAsyncLifetime.DisposeAsync()
    {
        Client.Dispose();
        await DisposeAsync();
        await _configuration.DisposeAsync();
    }

    protected virtual Task SetUp()
    {
        return Task.CompletedTask;
    }

    public Database CreateDatabase()
    {
        return new Database(_configuration.DatabaseConnectionString);
    }

    public async ValueTask DisposeTestFilesAsync(string[] ids)
    {
        foreach (var id in ids)
        {
            var imagesPath = Path.Combine(_configuration.RootPath, "Image", id);
            var attempt = 0;
            do
            {
                try
                {
                    if (!Directory.Exists(imagesPath))
                        break;

                    Directory.Delete(imagesPath, true);
                }
                catch (Exception)
                {
                    attempt++;
                    await Task.Delay(TimeSpan.FromMilliseconds(50));
                }
            } while (attempt < 10);
        }
    }
}
