using LinqToDB.Data;
using MarkAsPlayed.Api.Data;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace MarkAsPlayed.Api.Tests;

internal class TestConfiguration : IAsyncDisposable
{
    private readonly string _mainDbConnectionString;

    private TestConfiguration(
        IConfiguration configuration, 
        string mainDbConnectionString, 
        string databaseName, 
        string rootPath,
        List<AdministrationUserData> administrationUsers)
    {
        _mainDbConnectionString = mainDbConnectionString;
        Value = configuration;
        DatabaseConnectionString = configuration.GetConnectionString("MainDatabase");
        DatabaseName = databaseName;
        RootPath = rootPath;
        AdministrationUsers = administrationUsers;
    }

    public IConfiguration Value { get; }
    public string DatabaseConnectionString { get; }
    public string DatabaseName { get; }
    public string RootPath { get; }
    public List<AdministrationUserData> AdministrationUsers { get; }

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
            case "CHECK IF DB EXIST":
                return $"SELECT EXISTS (SELECT * FROM pg_database WHERE datname = '{databaseName}')";
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

        var administrationUsers = configuration.GetSection("AdministrationUsers").Get<List<AdministrationUserData>>();

        return new TestConfiguration(
            configuration,
            mainDbConnectionString,
            testDbName,
            rootPath,
            administrationUsers
        );
    }

    public async ValueTask DisposeAsync()
    {
        await using var db = new Database(_mainDbConnectionString);
        var mainDbName = ExtractDatabaseNameFromConnectionString(_mainDbConnectionString);

        var attempt = 0;
        do
        {
            try
            {
                if (!(await db.ExecuteAsync<bool>(GenerateSqlCommand("CHECK IF DB EXIST", DatabaseName, mainDbName))))
                    return;

                await db.ExecuteAsync(GenerateSqlCommand("DROP", DatabaseName));
                return;
            }
            catch (PostgresException e)
            {
                if (e.SqlState == PostgresErrorCodes.AdminShutdown)
                {
                    attempt++;
                    await Task.Delay(TimeSpan.FromMilliseconds(250));
                }
                else
                {
                    throw;
                }
            }
        } while (attempt < 20);
    }

    public async Task SetUpTestDatabaseAsync()
    {
        var migrator = new Migrator();
        await migrator.TestRunAsync(_mainDbConnectionString);
        var mainDbName = ExtractDatabaseNameFromConnectionString(_mainDbConnectionString);
        await using var db = new Database(_mainDbConnectionString);
        var setupConfigurationHandler = new SetupConfigurationHandler();

        var executedScripts = new List<string> { "1681487562_clear_author_table" };

        var attempt = 0;
        do
        {
            try
            {
                await SeverOtherConnections(db, mainDbName);
                if (await db.ExecuteAsync<bool>(GenerateSqlCommand("CHECK IF DB EXIST", DatabaseName, mainDbName)))
                    return;

                await db.ExecuteAsync(GenerateSqlCommand("CREATE", DatabaseName, mainDbName));
                await setupConfigurationHandler.InsertAdministrationUsers(AdministrationUsers, _mainDbConnectionString, false);
                await setupConfigurationHandler.IntegrationTestsDatabasePostFixer(_mainDbConnectionString, executedScripts);
                return;
            }
            catch (PostgresException e)
            {
                if (e.SqlState == PostgresErrorCodes.AdminShutdown)
                {
                    attempt++;
                    await Task.Delay(TimeSpan.FromMilliseconds(250));
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
}
