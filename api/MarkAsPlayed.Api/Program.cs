using MarkAsPlayed.Api.Data;
using MarkAsPlayed.Api.Modules.Article;
using MarkAsPlayed.Api.Modules.Author;
using MarkAsPlayed.Api.Modules.Image;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption;
using Microsoft.AspNetCore.DataProtection.AuthenticatedEncryption.ConfigurationModel;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

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

// Setting modules

ArticleConfiguration.ConfigureModule(builder.Services);
ImageConfiguration.ConfigureModule(builder.Services);
AuthorConfiguration.ConfigureModule(builder.Services);

var app = builder.Build();

// Configure the HTTP request pipeline.

app.MapHealthChecks("/health");

Console.WriteLine("Starting the application");
var configuration = app.Services.GetService<IConfiguration>();
if (configuration is null)
{
    throw new ArgumentNullException("Configuration could not be resolved");
}
Console.ForegroundColor = ConsoleColor.Green;
Console.WriteLine("Configuration resolved correctly");
Console.ResetColor();

Console.WriteLine("Start migrations");
var migrator = new Migrator();
await migrator.RunAsync(configuration.GetConnectionString("MainDatabase"));

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
