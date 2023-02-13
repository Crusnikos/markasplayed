using MarkAsPlayed.Api;
using MarkAsPlayed.Api.Data;
using MarkAsPlayed.Api.Lookups;
using MarkAsPlayed.Api.Modules.Article;
using MarkAsPlayed.Api.Modules.Author;
using MarkAsPlayed.Api.Modules.Files;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption;
using Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption.ConfigurationModel;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Check for appsettings.json

var isTest = Convert.ToBoolean(builder.Configuration["TestingEnvironment"]);
SetupConfigurationHandler.CheckForConfiguration(builder.Configuration["RootPath"], isTest);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    var frontendURL = builder.Configuration["FrontendUrl"];
    var exposedHeaders = builder.Configuration.GetSection("Cors:ExposedHeaders").Get<List<string>>();

    options.AddDefaultPolicy(builder =>
    {
        builder.WithOrigins(frontendURL).
            AllowAnyMethod().
            AllowAnyHeader().
            WithExposedHeaders(exposedHeaders.ToArray());
    });
});

builder.Services.AddHealthChecks();

var postgresConnection = builder.Configuration.GetConnectionString("MainDatabase");
builder.Services.AddSingleton<Database.Factory>(_ => () => new Database(postgresConnection));

builder.Services.AddDataProtection()
        .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(builder.Configuration["RootPath"], "xml")))
        .UseCryptographicAlgorithms(
        new AuthenticatedEncryptorConfiguration
        {
            EncryptionAlgorithm = EncryptionAlgorithm.AES_256_CBC,
            ValidationAlgorithm = ValidationAlgorithm.HMACSHA256
        });

builder.Services.
    AddAuthentication(JwtBearerDefaults.AuthenticationScheme).
    AddJwtBearer(options =>
    {
        var projectId = builder.Configuration["Firebase:ProjectId"];
        options.Authority = "https://securetoken.google.com/" + projectId;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = "https://securetoken.google.com/" + projectId,
            ValidateAudience = true,
            ValidAudience = projectId,
            ValidateLifetime = true,
        };
    });

var loggingConfiguration = builder.Configuration.GetSection("Logging");
builder.Services.
    AddLogging(builder =>
    {
        builder
            .AddDebug()
            .AddConsole()
            .AddConfiguration(loggingConfiguration)
            .SetMinimumLevel(LogLevel.Information);
    });

// Setting modules

ArticleConfiguration.ConfigureModule(builder.Services);
FilesConfiguration.ConfigureModule(builder.Services);
AuthorConfiguration.ConfigureModule(builder.Services);
LookupConfiguration.ConfigureModule(builder.Services);

var app = builder.Build();

// Configure the HTTP request pipeline.

app.MapHealthChecks("/health");

if(isTest is false)
{
    Console.WriteLine("-----\nStarting the application");
    var configuration = app.Services.GetService<IConfiguration>();
    if (configuration is null)
    {
        throw new ArgumentNullException("Configuration could not be resolved");
    }
    Console.ForegroundColor = ConsoleColor.Green;
    Console.WriteLine("Configuration resolved correctly");
    Console.ResetColor();

    Console.WriteLine("-----\nStart migrations");
    var migrator = new Migrator();
    var executedScripts = await migrator.RunAsync(configuration.GetConnectionString("MainDatabase"));

    var administrationUsers = configuration.GetSection("AdministrationUsers").Get<List<AdministrationUserData>>();
    var setupConfigurationHandler = new SetupConfigurationHandler();
    Console.WriteLine($"-----\nInsert {administrationUsers.Count} administration users");
    await setupConfigurationHandler.InsertAdministrationUsers(administrationUsers, postgresConnection);

    Console.WriteLine("-----\nRun post database fixes");
    await setupConfigurationHandler.DatabasePostFixer(postgresConnection, executedScripts);

    Console.WriteLine("-----\n");
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(builder.Configuration["RootPath"], "Image")),
    RequestPath = "/Image"
});

app.UseCors();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program { }
