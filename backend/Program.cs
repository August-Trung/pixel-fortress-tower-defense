using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Services;
using backend.Models;

var builder = WebApplication.CreateBuilder(args);

// Read port from environment variable (Render)
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Configure SQLite Connection
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Data Source=pixelfortress.db";
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString));

// Register Services
builder.Services.AddScoped<IPlayerService, PlayerService>();
builder.Services.AddScoped<IScoreService, ScoreService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://your-frontend-domain.com" // Placeholder for production domain
        )
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();

app.UseAuthorization();

app.MapControllers();

// Automatically apply database schema creation on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.EnsureCreated();

        // Seed data if database is empty (Demo Seed Data)
        if (!context.Players.Any())
        {
            var players = new List<Player>
            {
                new Player { Name = "Galahad", CreatedAt = DateTime.UtcNow.AddDays(-5) },
                new Player { Name = "Arthur", CreatedAt = DateTime.UtcNow.AddDays(-4) },
                new Player { Name = "Lancelot", CreatedAt = DateTime.UtcNow.AddDays(-3) },
                new Player { Name = "Robin", CreatedAt = DateTime.UtcNow.AddDays(-2) },
                new Player { Name = "Merlin", CreatedAt = DateTime.UtcNow.AddDays(-1) }
            };
            
            context.Players.AddRange(players);
            context.SaveChanges();
            
            var scores = new List<Score>
            {
                new Score { PlayerId = players[0].Id, ScoreValue = 4850, WavesCompleted = 10, EnemiesKilled = 78, TotalGoldEarned = 1150, RemainingHP = 18, TimePlayed = 380, CreatedAt = DateTime.UtcNow.AddDays(-5) },
                new Score { PlayerId = players[1].Id, ScoreValue = 5120, WavesCompleted = 10, EnemiesKilled = 82, TotalGoldEarned = 1210, RemainingHP = 20, TimePlayed = 360, CreatedAt = DateTime.UtcNow.AddDays(-4) },
                new Score { PlayerId = players[2].Id, ScoreValue = 4320, WavesCompleted = 10, EnemiesKilled = 75, TotalGoldEarned = 1080, RemainingHP = 15, TimePlayed = 410, CreatedAt = DateTime.UtcNow.AddDays(-3) },
                new Score { PlayerId = players[3].Id, ScoreValue = 2850, WavesCompleted = 8, EnemiesKilled = 62, TotalGoldEarned = 850, RemainingHP = 0, TimePlayed = 320, CreatedAt = DateTime.UtcNow.AddDays(-2) },
                new Score { PlayerId = players[4].Id, ScoreValue = 5500, WavesCompleted = 10, EnemiesKilled = 85, TotalGoldEarned = 1250, RemainingHP = 20, TimePlayed = 340, CreatedAt = DateTime.UtcNow.AddDays(-1) }
            };
            
            context.Scores.AddRange(scores);
            context.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred creating the SQLite database.");
    }
}

app.Run();
