using backend.app.models.core;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.app.configurations.resources.database
{
    public class SubmissionRules : IEntityTypeConfiguration<Submission>
    {
        public void Configure(EntityTypeBuilder<Submission> builder)
        {
            builder.Property(s => s.Content).IsRequired();

            builder.Property(s => s.Status).IsRequired();

            builder
                .HasOne(s => s.Assignment)
                .WithMany(a => a.Submissions)
                .HasForeignKey(s => s.AssignmentId)
                .OnDelete(DeleteBehavior.Cascade);

            builder
                .HasOne(s => s.User)
                .WithMany(u => u.Submissions)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(s => new { s.UserId, s.AssignmentId });

            builder.HasQueryFilter(s => s.User.Status != UserStatus.SoftDelete);
        }
    }
}
