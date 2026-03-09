namespace backend.app.models.core
{
    public enum SchoolStatus
    {
        Active,
        Inactive,
        SoftDelete,
    }

    public class School : ITimestamped
    {
        public int Id { get; set; }
        public int Name { get; set; }
        public int Location { get; set; }
        public int PrincipalId { get; set; }
        public User Principal { get; set; } = null!;
        public required string ImageUrl { get; set; }
        public int TeacherNumber { get; set; } = 0;
        public int CoursesNumber { get; set; } = 0;
        public ICollection<Course> Courses { get; set; } = [];
        public SchoolStatus Status { get; set; } = SchoolStatus.Active;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
