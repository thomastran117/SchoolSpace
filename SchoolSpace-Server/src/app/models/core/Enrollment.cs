namespace backend.app.models.core
{
    public class Enrollment : ITimestamped
    {
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public int CourseId { get; set; }
        public Course Course { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
