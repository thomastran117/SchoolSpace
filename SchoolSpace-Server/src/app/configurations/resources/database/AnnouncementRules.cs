using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using backend.app.models.core;

namespace backend.app.configurations.resources.database
{
       public class AnnouncementRules : IEntityTypeConfiguration<Announcement>
       {
              public void Configure(EntityTypeBuilder<Announcement> builder)
              {
                    builder.Property(a => a.Title)
                            .IsRequired()
                            .HasMaxLength(255);

                    builder.Property(a => a.Content)
                            .IsRequired();

                    builder.HasOne(a => a.Course)
                            .WithMany(c => c.Announcements)
                            .HasForeignKey(a => a.CourseId)
                            .OnDelete(DeleteBehavior.Cascade);
              }
       }
}
