using MarkAsPlayed.Api.Data;
using LinqToDB;
using MarkAsPlayed.Api.Data.Models;
using LinqToDB.Data;
using Npgsql;

namespace MarkAsPlayed.Api;

public class SetupConfigurationHandler
{
    public static void CheckForConfiguration(string rootPath, bool isTest)
    {
        var env = string.Empty;

        try
        {
            env = isTest ? "appsettings.Test.json" : "appsettings.json";
            var isFileExist = File.Exists(Path.Combine(rootPath, env));
        }
        catch (Exception)
        {
            throw new FileNotFoundException($"{env} file not found");
        }
    }

    public async Task InsertAdministrationUsers(
        IList<AdministrationUserData> administrationUsers, 
        string connectionString,
        bool displaySuccessMessages = true,
        CancellationToken cancellationToken = default)
    {
        if (administrationUsers.Count == 0)
            throw new Exception("Minimum 1 administration user required");

        if (connectionString == null)
            throw new ArgumentNullException("Missing connection string");

        try
        {
            using (Database dbConection = new Database(connectionString))
            {
                foreach (var user in administrationUsers.Distinct())
                {
                    var author = await dbConection.Authors.FirstOrDefaultAsync(a => a.FirebaseId == user.FirebaseId, cancellationToken);
                    if (author != null) continue;

                    await dbConection.Authors.InsertAsync(
                        () => new Author
                        {
                            FirebaseId = user.FirebaseId,
                            Name = user.Name,
                            DescriptionPl = user.DescriptionPl,
                            DescriptionEn = user.DescriptionEn
                        },
                        cancellationToken
                    );
                }
            }  
        }
        catch (PostgresException e)
        {
            if (e.SqlState == PostgresErrorCodes.AdminShutdown)
                throw;
            else
                throw new Exception(e.Message);
        }

        if (displaySuccessMessages)
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("Users inserted correctly");
            Console.ResetColor();
        }

        return;
    }

    public async Task DatabasePostFixer(
        string connectionString, 
        List<string> executedScripts,
        bool displaySuccessMessages = true,
        CancellationToken cancellationToken = default)
    {
        if (executedScripts.Any(s => s.Contains("1681487562_clear_author_table")))
            await ArticleTableMissingAuthorsFix(connectionString, displaySuccessMessages, cancellationToken);
        else
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("Article table 'missing authors fix' not required and omitted");
            Console.ResetColor();
        }
    }

    private async Task ArticleTableMissingAuthorsFix(string connectionString, bool displaySuccessMessages, CancellationToken cancellationToken = default)
    {
        if (connectionString == null)
            throw new ArgumentNullException("Missing connection string");

        try
        {
            using (Database dbConection = new Database(connectionString))
            {
                if (dbConection.Authors.Count() == 0)
                    throw new Exception("Minimum 1 administration user required");

                await dbConection.ExecuteAsync(
                    "alter table article " +
                        "add column if not exists created_by_author_id integer not null references author (author_id) " +
                        "default 1", 
                    cancellationToken);
            }
        }
        catch (PostgresException e)
        {
            if (e.SqlState == PostgresErrorCodes.AdminShutdown)
                throw;
            else
                throw new Exception(e.Message);
        }

        if (displaySuccessMessages)
        {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("Article table missing authors fix run correctly");
            Console.ResetColor();
        }

        return;
    }
}

public class AdministrationUserData
{
    public string FirebaseId { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string DescriptionPl { get; set; } = default!;
    public string DescriptionEn { get; set; } = default!;
}

