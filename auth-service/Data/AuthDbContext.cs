using AuthService.Models;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Data;

/// <summary>
/// Entity Framework Core DbContext for the Auth Service.
/// Manages User entities in PostgreSQL.
/// </summary>
public class AuthDbContext : DbContext
{
    public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options)
    {
    }

    /// <summary>
    /// Users table containing all registered users.
    /// </summary>
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            // Primary key
            entity.HasKey(u => u.Id);

            // Username must be unique for authentication
            entity.HasIndex(u => u.Name).IsUnique();

            // Name is required and has max length
            entity.Property(u => u.Name)
                .IsRequired()
                .HasMaxLength(50);

            // PasswordHash is required (no max length as hash length varies)
            entity.Property(u => u.PasswordHash)
                .IsRequired();

            // Role is required with a default value
            entity.Property(u => u.Role)
                .IsRequired()
                .HasMaxLength(20)
                .HasDefaultValue(UserRoles.Member);
        });
    }
}
