namespace backend.app.services.interfaces
{
    public interface ILoginSecurityService
    {
        Task EnsureAccountNotLockedAsync(string email);
        Task RecordFailedAttemptAsync(string email, string ipAddress);
        Task RecordSuccessfulLoginAsync(int userId, string email, string ipAddress, string clientName, string deviceType);
        Task<bool> UnlockAccountAsync(string unlockToken);
    }
}
