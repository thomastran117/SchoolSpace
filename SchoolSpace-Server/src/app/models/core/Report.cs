namespace backend.app.models.core
{
    public enum ReportStatus
    {
        Pending,
        UnderReview,
        Resolved,
        Dismissed
    }

    public class Report : ITimestamped
    {
        public int Id { get; set; }
        public int ReporterId { get; set; }
        public int ReportedUserId { get; set; }
        public required string Reason { get; set; }
        public ReportStatus Status { get; set; } = ReportStatus.Pending;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
