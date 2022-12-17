using LinqToDB.Data;
using MarkAsPlayed.Api.Data;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace MarkAsPlayed.Api.Tests;

internal class TestConfiguration : IAsyncDisposable
{
    private readonly string _mainDbConnectionString;

    private TestConfiguration(IConfiguration configuration, string mainDbConnectionString, string databaseName, string rootPath)
    {
        _mainDbConnectionString = mainDbConnectionString;
        Value = configuration;
        DatabaseConnectionString = configuration.GetConnectionString("MainDatabase");
        DatabaseName = databaseName;
        RootPath = rootPath;
    }

    public IConfiguration Value { get; }
    public string DatabaseConnectionString { get; }
    public string DatabaseName { get; }
    public string RootPath { get; }

    private static string ExtractDatabaseNameFromConnectionString(string connectionString)
    {
        var databaseName = new NpgsqlConnectionStringBuilder(connectionString).Database;
        if (databaseName is null)
        {
            throw new InvalidOperationException("Database value was null in the connection string builder");
        }
        else
        {
            return databaseName;
        }
    }

    private static string GenerateTestDatabaseName(string prefix)
    {
        return $"{prefix}_{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}_{Guid.NewGuid().ToString().Replace("-", "0")}";
    }

    private static string GenerateSqlCommand(string command, string databaseName, string? template = null)
    {
        switch (command)
        {
            case "DROP":
                return $"DROP DATABASE {databaseName} WITH (FORCE)";
            case "CREATE":
                return $"CREATE DATABASE {databaseName} TEMPLATE {template}";
            default:
                throw new InvalidOperationException("command not recognized");
        }
    }

    public static TestConfiguration Create()
    {
        var configurationBuilder = new ConfigurationBuilder().AddJsonFile("appsettings.Test.json");
        var configuration = configurationBuilder.Build();
        var mainDbConnectionString = configuration.GetConnectionString("MainDatabase");
        var rootPath = configuration["RootPath"];

        var testDbName = GenerateTestDatabaseName(ExtractDatabaseNameFromConnectionString(mainDbConnectionString));
        var testDbConnectionString =
            new NpgsqlConnectionStringBuilder(mainDbConnectionString) { Database = testDbName, Pooling = false }.ConnectionString;

        configuration["ConnectionStrings:MainDatabase"] = testDbConnectionString;

        return new TestConfiguration(
            configuration,
            mainDbConnectionString,
            testDbName,
            rootPath
        );
    }

    public async ValueTask DisposeAsync()
    {
        await using var db = new Database(_mainDbConnectionString);

        var attempt = 0;
        do
        {
            try
            {
                await db.ExecuteAsync(GenerateSqlCommand("DROP", DatabaseName));
                return;
            }
            catch (PostgresException e)
            {
                if (e.SqlState == PostgresErrorCodes.AdminShutdown)
                {
                    attempt++;
                    await Task.Delay(TimeSpan.FromMilliseconds(50));
                }
                else
                {
                    throw;
                }
            }
        } while (attempt < 20);
    }

    private static async Task SeverOtherConnections(Database connection, string databaseName,
        CancellationToken cancellationToken = default)
    {
        await connection.ExecuteAsync(
            @"
                SELECT
	                pg_terminate_backend(pg_stat_activity.pid)
                FROM
	                pg_stat_activity
                WHERE
	                pg_stat_activity.datname = @db_name
	                AND pid <> pg_backend_pid()
            ",
            cancellationToken,
            (object)new DataParameter("db_name", databaseName)
        );
    }

    public async Task SetUpTestDatabaseAsync()
    {
        var migrator = new Migrator();
        await migrator.TestRunAsync(_mainDbConnectionString);
        var mainDbName = ExtractDatabaseNameFromConnectionString(_mainDbConnectionString);
        await using var db = new Database(_mainDbConnectionString);

        var attempt = 0;
        do
        {
            try
            {
                await SeverOtherConnections(db, mainDbName);
                await db.ExecuteAsync(GenerateSqlCommand("CREATE", DatabaseName, mainDbName));
                return;
            }
            catch (PostgresException e)
            {
                if (e.SqlState == PostgresErrorCodes.AdminShutdown)
                {
                    attempt++;
                    await Task.Delay(TimeSpan.FromMilliseconds(50));
                }
                else
                {
                    throw;
                }
            }
        } while (attempt < 20);
    }
}
