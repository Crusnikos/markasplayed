using DbUp;
using DbUp.Engine;

namespace MarkAsPlayed.Api.Data;

public sealed class Migrator
{
    private UpgradeEngine Deploy(string connectionString)
    {
        return DeployChanges.To.
            PostgresqlDatabase(connectionString).
            WithScriptsEmbeddedInAssembly(typeof(Migrator).Assembly).
            WithTransaction().
            WithExecutionTimeout(TimeSpan.FromMinutes(1)).
            LogToNowhere().
            Build();
    }

    public Task<List<string>> RunAsync(string connectionString, CancellationToken cancellationToken = default)
    {
        if (connectionString == null)
        {
            throw new ArgumentNullException("Missing connection string");
        }

        var engine = Deploy(connectionString);

        if (!engine.IsUpgradeRequired())
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("Database upgrade is not required");
            Console.ResetColor();
            return Task.FromResult(new List<string>());
        }

        Console.WriteLine($"Number of scripts to execute: {engine.GetScriptsToExecute().Count}");

        var operation = engine.PerformUpgrade();
        var executedScripts = engine.GetExecutedScripts();

        if (operation.Successful)
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("Database successfully upgraded");
            Console.ResetColor();
            return Task.FromResult(executedScripts);
        }
        else
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("Database could not be updated");
            Console.ResetColor();
            Console.WriteLine("\n");

            Console.WriteLine("Error:");
            Console.WriteLine(operation.Error.Message);
            Console.WriteLine("\n");

            return Task.FromResult(executedScripts);
        }
    }

    public Task TestRunAsync(string connectionString, CancellationToken cancellationToken = default)
    {
        if (connectionString == null)
        {
            throw new ArgumentNullException("Missing connection string");
        }

        var engine = Deploy(connectionString);

        if (!engine.IsUpgradeRequired())
        {
            return Task.CompletedTask;
        }

        var operation = engine.PerformUpgrade();
        if (operation.Successful)
        {
            return Task.CompletedTask;
        }
        else
        {
            return Task.CompletedTask;
        }
    }
}
