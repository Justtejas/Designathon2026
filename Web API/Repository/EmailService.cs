using Hexa_Hub.Interface;
using System.Net.Mail;
using System.Net;
using Hexa_Hub.Models;
using Microsoft.Extensions.Options;
namespace Hexa_Hub.Repository
{
    public class EmailService : IEmail
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string message)
        {
            var smtpServer = _configuration["Email:SmtpServer"];
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"]);
            var smtpuserName = _configuration["Email:SmtpuserName"];
            var smtpPassword = _configuration["Email:SmtpPassword"];

            using var smtpClient = new SmtpClient(smtpServer, smtpPort)
            {
                Credentials = new NetworkCredential(smtpuserName, smtpPassword),
                EnableSsl = true
            };

            var mailMessage = new MailMessage
            {
                From = new Mailaddress(smtpuserName),  // Use dynamic sender
                Subject = subject,
                Body = message,
                IsBodyHtml = true,
            };

            mailMessage.To.Add(toEmail);

            await smtpClient.SendMailAsync(mailMessage);
        }
    }


}

