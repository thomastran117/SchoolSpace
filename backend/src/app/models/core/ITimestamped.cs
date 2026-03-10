namespace backend.app.models.core
{
    public interface ITimestamped
    {
        DateTime CreatedAt { get; set; }
        DateTime UpdatedAt { get; set; }
    }
}
