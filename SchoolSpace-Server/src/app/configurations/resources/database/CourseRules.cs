using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.app.models.core;

namespace backend.app.configurations.resources.database
{
       public class CourseRules : IEntityTypeConfiguration<Course>
       {
              public void Configure(EntityTypeBuilder<Course> builder)
              {
                    builder.Property(c => c.Name)
                            .IsRequired()
                            .HasMaxLength(255);

                    builder.Property(c => c.Status)
                            .IsRequired();

                    builder.HasOne(c => c.Teacher)
                            .WithMany(u => u.Courses)
                            .HasForeignKey(c => c.TeacherId)
                            .OnDelete(DeleteBehavior.Restrict);

                    builder.HasOne(c => c.School)
                            .WithMany(s => s.Courses)
                            .HasForeignKey(c => c.SchoolId)
                            .OnDelete(DeleteBehavior.Cascade);

                    builder.HasQueryFilter(c => c.Status != CourseStatus.SoftDelete);
              }
       }
}
