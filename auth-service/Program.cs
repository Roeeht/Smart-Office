using AuthService.Data;
using AuthService.Models;
using AuthService.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container

// Configure PostgreSQL database connection
// Connection string comes from environment variable in production
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? builder.Configuration["DATABASE_URL"]
    ?? throw new InvalidOperationException("Database connection string is not configured");

builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseNpgsql(connectionString));

// Register password hasher for secure password hashing
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

// Register application services
builder.Services.AddScoped<IAuthService, AuthServiceImpl>();
builder.Services.AddScoped<IJwtService, JwtService>();

// Register Admin seeder as a hosted service (runs on startup)
builder.Services.AddHostedService<AdminSeeder>();

// Configure CORS for frontend access
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();

// Configure Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Auth Service API", Version = "v1" });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

app.MapControllers();

// Log startup information
var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("Auth Service starting on {Environment}", app.Environment.EnvironmentName);

app.Run();
