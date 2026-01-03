using AuthService.Data;
using AuthService.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Services;

/// <summary>
/// Background service that seeds an initial Admin user on startup.
/// Only creates the Admin if no users exist in the database.
/// Admin credentials come from environment variables for security.
/// </summary>
public class AdminSeeder : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AdminSeeder> _logger;

    public AdminSeeder(IServiceProvider serviceProvider, ILogger<AdminSeeder> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<User>>();

        // Ensure database is created (EnsureCreated for demo, MigrateAsync for production)
        await context.Database.EnsureCreatedAsync(cancellationToken);

        // Only seed if no users exist (first run)
        if (await context.Users.AnyAsync(cancellationToken))
        {
            _logger.LogInformation("Users already exist, skipping Admin seed");
            return;
        }

        // Get Admin credentials from environment variables
        var adminName = configuration["SEED_ADMIN_NAME"];
        var adminPassword = configuration["SEED_ADMIN_PASSWORD"];

        if (string.IsNullOrEmpty(adminName) || string.IsNullOrEmpty(adminPassword))
        {
            _logger.LogWarning(
                "SEED_ADMIN_NAME and/or SEED_ADMIN_PASSWORD not configured. " +
                "No Admin user will be seeded. You can register users but they will all be Members.");
            return;
        }

        // Create the Admin user
        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            Name = adminName,
            PasswordHash = string.Empty,
            Role = UserRoles.Admin
        };

        adminUser.PasswordHash = passwordHasher.HashPassword(adminUser, adminPassword);

        context.Users.Add(adminUser);
        await context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Admin user '{AdminName}' seeded successfully. " +
            "This is the only way to create an Admin account.",
            adminName);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
