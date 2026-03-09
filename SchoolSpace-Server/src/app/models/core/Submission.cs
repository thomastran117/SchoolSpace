namespace backend.app.models.core
{
    public enum SubmissionStatus
    {
        Submitted,
        Graded,
        Late,
        Returned,
    }

    public class Submission : ITimestamped
    {
        public int Id { get; set; }
        public required string Content { get; set; }
        public string? FileUrl { get; set; }
        public int? Grade { get; set; }
        public string? Feedback { get; set; }
        public SubmissionStatus Status { get; set; } = SubmissionStatus.Submitted;
        public int AssignmentId { get; set; }
        public Assignment Assignment { get; set; } = null!;
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
