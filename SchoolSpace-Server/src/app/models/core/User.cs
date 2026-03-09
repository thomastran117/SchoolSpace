namespace backend.app.models.core
{
    public enum UserRole
    {
        Student,
        Teacher,
        Admin,
    }

    public enum UserStatus
    {
        Active,
        Inactive,
        SoftDelete,
    }

    public class User : ITimestamped
    {
        public int Id { get; set; }
        public required string Email { get; set; }
        public string? Password { get; set; }
        public required UserRole Usertype { get; set; }
        public required UserStatus Status { get; set; }
        public string? Username { get; set; }
        public string? Name { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Phone { get; set; }
        public string? MicrosoftId { get; set; }
        public string? GoogleId { get; set; }
        public School? School { get; set; }
        public ICollection<Course> TaughtCourses { get; set; } = [];
        public ICollection<Enrollment> Enrollments { get; set; } = [];
        public ICollection<Submission> Submissions { get; set; } = [];
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
