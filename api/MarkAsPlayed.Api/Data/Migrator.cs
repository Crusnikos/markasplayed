using DbUp;

namespace MarkAsPlayed.Api.Data;

public sealed class Migrator
{
    public Task RunAsync(string connectionString, CancellationToken cancellationToken = default)
    {
        if (connectionString == null)
        {
            throw new ArgumentNullException("Missing connection string");
        }

        var engine = DeployChanges.To.
            PostgresqlDatabase(connectionString).
            WithScriptsEmbeddedInAssembly(typeof(Migrator).Assembly).
            WithTransaction().
            WithExecutionTimeout(TimeSpan.FromMinutes(1)).
            LogToNowhere().
            Build();

        if (!engine.IsUpgradeRequired())
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("Database upgrade is not required");
            Console.ResetColor();
            return Task.CompletedTask;
        }

        Console.WriteLine($"Number of scripts to execute: {engine.GetScriptsToExecute().Count}");

        var operation = engine.PerformUpgrade();
        if (operation.Successful)
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("Database successfully upgraded");
            Console.ResetColor();
            return Task.CompletedTask;
        }
        else
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine("Database could not be updated");
            Console.ResetColor();
            return Task.CompletedTask;
        }
    }
}
