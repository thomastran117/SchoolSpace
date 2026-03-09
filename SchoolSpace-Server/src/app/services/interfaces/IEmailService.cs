namespace backend.app.services.interfaces
{
    public interface IEmailService
    {
        Task SendAccountLockedEmailAsync(string recipientEmail, string unlockToken);
        Task SendNewDeviceLoginEmailAsync(string recipientEmail, string ipAddress, string clientName, string deviceType, DateTime loginTime);
    }
}
