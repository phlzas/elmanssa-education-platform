using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;

namespace elmanassa.Services
{
    public class EmailSettings
    {
        public string SmtpHost { get; set; } = "";
        public int SmtpPort { get; set; } = 587;
        public string SmtpUser { get; set; } = "";
        public string SmtpPassword { get; set; } = "";
        public bool EnableSsl { get; set; } = true;
        public string FromEmail { get; set; } = "";
        public string FromName { get; set; } = "Elmanssa Platform";
    }

    public interface IEmailService
    {
        Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = true);
        Task<bool> SendWelcomeEmailAsync(string to, string name, string role);
        Task<bool> SendTeacherNotificationAsync(string to, string subject, string body);
        Task<bool> SendContactFormNotificationAsync(string name, string email, string subject, string message);
    }

    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = true)
        {
            try
            {
                using var client = new SmtpClient(_settings.SmtpHost, _settings.SmtpPort)
                {
                    Credentials = new NetworkCredential(_settings.SmtpUser, _settings.SmtpPassword),
                    EnableSsl = _settings.EnableSsl
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_settings.FromEmail, _settings.FromName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = isHtml
                };
                mailMessage.To.Add(to);

                await client.SendMailAsync(mailMessage);
                _logger.LogInformation("Email sent to {To} with subject: {Subject}", to, subject);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {To}", to);
                return false;
            }
        }

        public async Task<bool> SendWelcomeEmailAsync(string to, string name, string role)
        {
            var subject = "Welcome to Elmanssa Platform!";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif; direction: rtl;'>
                    <h2>أهلاً وسهلاً {name}!</h2>
                    <p>مرحباً بك في منصة المنسة للتعليم.</p>
                    <p>تم إنشاء حسابك بنجاح كـ <strong>{role}</strong>.</p>
                    <p>يمكنك الآن تسجيل الدخول واستخدام المنصة.</p>
                    <br>
                    <p>مع تحيات،<br>فريق المنسة</p>
                </body>
                </html>";

            return await SendEmailAsync(to, subject, body);
        }

        public async Task<bool> SendTeacherNotificationAsync(string to, string subject, string body)
        {
            var fullBody = $@"
                <html>
                <body style='font-family: Arial, sans-serif; direction: rtl;'>
                    <h2>{subject}</h2>
                    {body}
                    <br>
                    <p>مع تحيات،<br>فريق المنسة</p>
                </body>
                </html>";

            return await SendEmailAsync(to, subject, fullBody);
        }

        public async Task<bool> SendContactFormNotificationAsync(string name, string email, string subject, string message)
        {
            var emailSubject = $"Contact Form: {subject}";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif;'>
                    <h2>New Contact Form Submission</h2>
                    <p><strong>Name:</strong> {name}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Subject:</strong> {subject}</p>
                    <p><strong>Message:</strong></p>
                    <p>{message}</p>
                </body>
                </html>";

            // Send to the admin/support email
            return await SendEmailAsync("info@elmanssa.com", emailSubject, body);
        }
    }
}
