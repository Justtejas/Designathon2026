using Hexa_Hub.Interface;
using NuGet.ContentModel;
using static Hexa_Hub.Models.MultiValues;

namespace Hexa_Hub.Repository
{
    public class NotificationService : INotificationService
    {
        private readonly IEmail _emailService;

        public NotificationService(IEmail emailService)
        {
            _emailService = emailService;
        }

        //AUDIT NOTIFICATIONS
        public async Task SendAudit (string UserMail, string UserName, int AuditId)
        {
            var subject = "Aduit Request";
            var emailBody = $"Dear {UserName},<br><br>You have been assigned an Audit Request {AuditId} which needs to be completed ASAP.<br><br>Best regards,<br>HexaHub";

            await _emailService.SendEmailAsync(UserMail, subject, emailBody);
        }
        public async Task AduitCompleted(string UserMail,int AuditId)
        {
            var subject = "Aduit Request Completed";
            var emailBody = $"Greetings HexaHub,<br><br>Audit Request For Audit ID : {AuditId} has been Completed.";

            await _emailService.SendEmailAsync(UserMail, subject, emailBody);
        }

        public async Task AuditInProgress(string UserMail, int AuditId)
        {
            var subject = "Aduit Request Completed";
            var emailBody = $"Greetings HexaHub,<br><br>Audit Request For Audit ID : {AuditId} has been Set to InProgress.";

            await _emailService.SendEmailAsync(UserMail, subject, emailBody);
        }


        //ALLOCATION NOTIFICATIONS
        public async Task SendAllocationApproved(string userMail, string userName, string assetName, int assetId)
        {
            var subject = "Asset Request Approved";
            var emailBody = $"Dear {userName},<br><br>Your Asset Request for AssetId {assetId} - {assetName} has been approved. Please collect it within a week of allocation.<br><br>Best regards,<br>HexaHub";

            await _emailService.SendEmailAsync(userMail, subject, emailBody);
        }

        public async Task SendAllocationRejected(string UserMail, string UserName, string AssetName, int assetId)
        {
            var subject = "Asset Request Declined";
            var emailBody = $"Dear {UserName},<br><br>Your Asset Request for AssetId {assetId} - {AssetName} has been Rejected. Please Contact your manager for futher questions.<br><br>Best regards,<br>HexaHub";

            await _emailService.SendEmailAsync(UserMail, subject, emailBody);
        }

        public async Task AssetRequestSent(string UserMail, int assetId)
        {
            var subject = "Asset Request";
            var emailBody = $"Greetings HexaHub,<br><br>An Asset Request for AssetId {assetId} has been Recieved.";

            await _emailService.SendEmailAsync(UserMail, subject, emailBody);
        }

        //SERVICE REQUEST NOTIFICATIONS
        
        public async Task ServiceRequestSent(string UserMail, int AssetId, int ServiceId, IssueType issueType)
        {
            var subject = "Service Request";
            var emailBody = $"Greetings HexaHub,<br><br>An Service Request has been Raised for Asset Id {AssetId} with Service Id {ServiceId} as {issueType.ToString()} .";

            await _emailService.SendEmailAsync(UserMail, subject, emailBody);
        }

        public async Task ServiceRequestApproved(string UserMail, string UserName, int AssetId, int ServiceId, IssueType issueType)
        {
            var subject = "Service Request Approved";
            var emailBody = $"Dear {UserName},<br><br>Service Request {ServiceId} which have been Raised for {AssetId} with {issueType.ToString()} has been Approved .<br><br>Best regards,<br>HexaHub";

            await _emailService.SendEmailAsync(UserMail, subject, emailBody);
        }

        public async Task ServiceRequestCompleted(string UserMail, string UserName, int AssetId, int ServiceId, IssueType issueType)
        {
            var subject = "Service Request Completion";
            var emailBody = $"Dear {UserName},<br><br>Service Request {ServiceId} which have been Raised for {AssetId} with {issueType.ToString()} has been Completed and the cost will be detained from salary .<br><br>Best regards,<br>HexaHub";

            await _emailService.SendEmailAsync(UserMail, subject, emailBody);
        }

        //RETURN REQUEST NOTIFICATIONS

        public async Task ReturnRequestSent(string UserMail, int AssetId, int ReturnId)
        {
            var subject = "Return Request";
            var emailBody = $"Greetings HexaHub,<br><br>An Return Request has been Raised for {AssetId} with {ReturnId} .";

            await _emailService.SendEmailAsync(UserMail, subject, emailBody);
        }

        public async Task ReturnRequestApproved(string UserMail, string UserName, int AssetId, int ReturnId)
        {
            var subject = "Return Request Approved";
            var emailBody = $"Dear {UserName},<br><br>Return Request {ReturnId} which have been Raised for {AssetId} has been Approved .<br><br>Best regards,<br>HexaHub";

            await _emailService.SendEmailAsync(UserMail, subject, emailBody);
        }

        public async Task ReturnRequestCompleted(string UserMail, string UserName, int AssetId)
        {
            var subject = "Asset Returned";
            var emailBody = $"Dear {UserName},<br><br>Thank you for returning the asset {AssetId} .<br><br>Best regards,<br>HexaHub";
            await _emailService.SendEmailAsync(UserMail, subject, emailBody);
        }

        public async Task ReturnRequestRejected(string UserMail, string UserName, int AssetId, int ReturnId)
        {
            var subject = "Return Request Declined";
            var emailBody = $"Dear {UserName},<br><br>Return Request {ReturnId} which have been Raised for {AssetId} has been Rejected .<br><br>Best regards,<br>HexaHub";

            await _emailService.SendEmailAsync(UserMail, subject, emailBody);
        }

        //User Added
        public async Task UserProfileCreated(string UserMail, string UserName, string Password)
        {
            var subject = "Hexahub Profile";
            var emailBody = $"Dear {UserName},<br><br>Your Profile has been created for HexaHub Platform. Once You logs in please update your details for further procedures. <br><br>To Log into Hexahub use http://localhost:5173/ <br><br>UserEmail : {UserMail} <br><br>Password:{Password} <br><br>Best regards,<br>HexaHub";


            await _emailService.SendEmailAsync(UserMail, subject, emailBody);
        }

    }
}
