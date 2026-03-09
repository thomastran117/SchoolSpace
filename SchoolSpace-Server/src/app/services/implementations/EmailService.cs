using backend.app.configurations.environment;
using backend.app.services.interfaces;
using backend.app.utilities.interfaces;

using MailKit.Net.Smtp;
using MimeKit;

namespace backend.app.services.implementations
{
    public sealed class EmailService : IEmailService
    {
        private readonly ICustomLogger _logger;

        public EmailService(ICustomLogger logger)
        {
            _logger = logger;
        }

        public async Task SendAccountLockedEmailAsync(string recipientEmail, string unlockToken)
        {
            var subject = "SchoolSpace - Account Temporarily Locked";
            var body = $"""
                <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Account Locked</h2>
                    <p>Your SchoolSpace account has been temporarily locked due to multiple failed login attempts.</p>
                    <p>If this was you, you can wait 30 minutes for the lock to expire automatically, or unlock your account now:</p>
                    <p><strong>Unlock Token:</strong> {unlockToken}</p>
                    <p>If you did not attempt to log in, we recommend changing your password immediately after unlocking.</p>
                    <br/>
                    <p style="color: #888; font-size: 12px;">This is an automated message from SchoolSpace. Do not reply.</p>
                </body>
                </html>
                """;

            await SendEmailAsync(recipientEmail, subject, body);
        }

        public async Task SendNewDeviceLoginEmailAsync(string recipientEmail, string ipAddress, string clientName, string deviceType, DateTime loginTime)
        {
            var subject = "SchoolSpace - New Device Login Detected";
            var body = $"""
                <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <h2>New Device Login</h2>
                    <p>A login to your SchoolSpace account was detected from a new device or location.</p>
                    <table style="border-collapse: collapse; margin: 16px 0;">
                        <tr><td style="padding: 4px 12px; font-weight: bold;">IP Address</td><td style="padding: 4px 12px;">{ipAddress}</td></tr>
                        <tr><td style="padding: 4px 12px; font-weight: bold;">Browser</td><td style="padding: 4px 12px;">{clientName}</td></tr>
                        <tr><td style="padding: 4px 12px; font-weight: bold;">Device</td><td style="padding: 4px 12px;">{deviceType}</td></tr>
                        <tr><td style="padding: 4px 12px; font-weight: bold;">Time (UTC)</td><td style="padding: 4px 12px;">{loginTime:yyyy-MM-dd HH:mm:ss} UTC</td></tr>
                    </table>
                    <p>If this was you, no action is needed.</p>
                    <p>If you do not recognize this activity, please change your password immediately.</p>
                    <br/>
                    <p style="color: #888; font-size: 12px;">This is an automated message from SchoolSpace. Do not reply.</p>
                </body>
                </html>
                """;

            await SendEmailAsync(recipientEmail, subject, body);
        }

        private async Task SendEmailAsync(string recipientEmail, string subject, string htmlBody)
        {
            var smtpServer = EnvironmentSetting.SmtpServer;
            var senderEmail = EnvironmentSetting.Email;
            var senderPassword = EnvironmentSetting.Password;

            if (string.IsNullOrWhiteSpace(smtpServer) ||
                string.IsNullOrWhiteSpace(senderEmail) ||
                string.IsNullOrWhiteSpace(senderPassword))
            {
                _logger.Warn("[EmailService] SMTP not configured — skipping email send.");
                return;
            }

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("SchoolSpace", senderEmail));
            message.To.Add(MailboxAddress.Parse(recipientEmail));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = htmlBody };

            using var client = new SmtpClient();
            try
            {
                await client.ConnectAsync(smtpServer, EnvironmentSetting.SmtpPort, MailKit.Security.SecureSocketOptions.StartTls);
                await client.AuthenticateAsync(senderEmail, senderPassword);
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
            }
            catch (Exception ex)
            {
                _logger.Error($"[EmailService] Failed to send email to {recipientEmail}: {ex.Message}");
            }
        }
    }
}
