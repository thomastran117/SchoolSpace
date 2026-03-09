using backend.app.models.core;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.app.configurations.resources.database
{
    public class SchoolRules : IEntityTypeConfiguration<School>
    {
        public void Configure(EntityTypeBuilder<School> builder)
        {
            builder.HasIndex(s => s.Name).IsUnique();
            builder.HasIndex(s => s.PrincipalId).IsUnique();

            builder.Property(s => s.Location).IsRequired();

            builder.Property(s => s.Status).IsRequired();

            builder
                .HasOne(s => s.Principal)
                .WithOne(u => u.School)
                .HasForeignKey<School>(s => s.PrincipalId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasQueryFilter(s => s.Status != SchoolStatus.SoftDelete);
        }
    }
}
