using Microsoft.EntityFrameworkCore;
using backend.app.models.core;

namespace backend.app.configurations.resources.database
{
    public class AppDatabaseContext : DbContext
    {
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<School> Schools { get; set; } = null!;
        public DbSet<Contact> Contacts { get; set; } = null!;
        public DbSet<Course> Courses { get; set; } = null!;
        public DbSet<Enrollment> Enrollments { get; set; } = null!;
        public DbSet<Report> Reports { get; set; } = null!;

        public AppDatabaseContext(DbContextOptions<AppDatabaseContext> options)
            : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDatabaseContext).Assembly);
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var now = DateTime.UtcNow;

            foreach (var entry in ChangeTracker.Entries<ITimestamped>())
            {
                if (entry.State == EntityState.Added)
                {
                    entry.Entity.CreatedAt = now;
                    entry.Entity.UpdatedAt = now;
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Entity.UpdatedAt = now;
                    entry.Property(nameof(ITimestamped.CreatedAt)).IsModified = false;
                }
            }

            return base.SaveChangesAsync(cancellationToken);
        }
    }
}