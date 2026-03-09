namespace backend.app.models.core
{
    public enum CourseStatus
    {
        Active,
        Inactive,
        SoftDelete,
    }

    public class Course : ITimestamped
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string CourseCode { get; set; }
        public string? Description { get; set; }
        public int TeacherId { get; set; }
        public User Teacher { get; set; } = null!;
        public int SchoolId { get; set; }
        public School School { get; set; } = null!;
        public ICollection<Enrollment> Enrollments { get; set; } = [];
        public CourseStatus Status { get; set; } = CourseStatus.Active;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
