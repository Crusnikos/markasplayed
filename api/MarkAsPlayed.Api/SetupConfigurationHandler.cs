using MarkAsPlayed.Api.Data;
using LinqToDB;
using MarkAsPlayed.Api.Data.Models;
using LinqToDB.Data;
using Npgsql;
using MarkAsPlayed.Api.Modules.Article;
using MarkAsPlayed.Api.Modules;

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

    public async Task IntegrationTestsDatabasePostFixer(string connectionString, List<string> executedScripts, CancellationToken cancellationToken = default)
    {
        if (executedScripts.Any(s => s.Contains("1681487562_clear_author_table")))
            await ArticleTableMissingAuthorsFix(connectionString, false, cancellationToken);
    }

    public async Task DatabasePostFixer(
        string connectionString, 
        List<string> executedScripts,
        IArticleHelper articleHelper,
        bool displaySuccessMessages = true,
        CancellationToken cancellationToken = default)
    {
        if (connectionString == null) throw new ArgumentNullException("Missing connection string");

        if (executedScripts.Any(s => s.Contains("1681487562_clear_author_table")))
            await ArticleTableMissingAuthorsFix(connectionString, displaySuccessMessages, cancellationToken);
        else
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("Article table 'missing authors fix' not required and omitted");
            Console.ResetColor();
        }

        if (executedScripts.Any(s => s.Contains("1688144618_add_article_history")))
            await InitialHistoryForExisitingArticlesFix(connectionString, displaySuccessMessages, articleHelper, cancellationToken);
        else
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine("Initial history for existing articles fix not required and omitted");
            Console.ResetColor();
        }
    }

    private async Task InitialHistoryForExisitingArticlesFix(string connectionString, bool displaySuccessMessages, IArticleHelper articleHelper, CancellationToken cancellationToken = default)
    {
        try
        {
            using (Database dbConection = new Database(connectionString))
            {
                var articles = dbConection.Articles.ToList();
                if (articles.Count == 0) return;

                foreach (var id in articles.Select(a => a.Id))
                {
                    var article = articleHelper.GetArticleFoundationData(dbConection, id);
                    var result = article.DetailedComparer();
                    var transactionId = Guid.NewGuid().ToString();

                    var creationDate = articles.FirstOrDefault(a => a.Id == id)!.CreatedAt;

                    var articleCreatedBy = articles.FirstOrDefault(a => a.Id == id)!.CreatedBy;
                    var requestor = dbConection.Authors.FirstOrDefault(a => a.Id == articleCreatedBy)!.FirebaseId;

                    await articleHelper.InsertArticleHistoryRecord(dbConection, id, result, requestor, transactionId, creationDate, cancellationToken);
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
            Console.WriteLine("Initial history for existing articles fix run correctly");
            Console.ResetColor();
        }

        return;
    }

    private async Task ArticleTableMissingAuthorsFix(string connectionString, bool displaySuccessMessages, CancellationToken cancellationToken = default)
    {
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

