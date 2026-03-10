using backend.app.models.core;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.app.configurations.resources.database
{
    public class AssignmentRules : IEntityTypeConfiguration<Assignment>
    {
        public void Configure(EntityTypeBuilder<Assignment> builder)
        {
            builder.Property(a => a.Title).IsRequired().HasMaxLength(255);

            builder.Property(a => a.MaxPoints).IsRequired();

            builder
                .HasOne(a => a.Course)
                .WithMany(c => c.Assignments)
                .HasForeignKey(a => a.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasQueryFilter(a => a.Course.Status != CourseStatus.SoftDelete);
        }
    }
}
