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
        public async Task SendAudit (string userMail, string userName, int auditId)
        {
            var subject = "Aduit Request";
            var emailBody = $"Dear {userName},<br><br>You have been assigned an Audit Request {auditId} which needs to be completed ASAP.<br><br>Best regards,<br>Maventory";

            await _emailService.SendEmailAsync(userMail, subject, emailBody);
        }
        public async Task AduitCompleted(string userMail,int auditId)
        {
            var subject = "Aduit Request Completed";
            var emailBody = $"Greetings Maventory,<br><br>Audit Request For Audit ID : {auditId} has been Completed.";

            await _emailService.SendEmailAsync(userMail, subject, emailBody);
        }

        public async Task AuditInProgress(string userMail, int auditId)
        {
            var subject = "Aduit Request Completed";
            var emailBody = $"Greetings Maventory,<br><br>Audit Request For Audit ID : {auditId} has been Set to InProgress.";

            await _emailService.SendEmailAsync(userMail, subject, emailBody);
        }


        //ALLOCATION NOTIFICATIONS
        public async Task SendAllocationApproved(string userMail, string userName, string assetName, int assetId)
        {
            var subject = "Asset Request Approved";
            var emailBody = $"Dear {userName},<br><br>Your Asset Request for assetId {assetId} - {assetName} has been approved. Please collect it within a week of allocation.<br><br>Best regards,<br>Maventory";

            await _emailService.SendEmailAsync(userMail, subject, emailBody);
        }

        public async Task SendAllocationRejected(string userMail, string userName, string assetName, int assetId)
        {
            var subject = "Asset Request Declined";
            var emailBody = $"Dear {userName},<br><br>Your Asset Request for assetId {assetId} - {assetName} has been Rejected. Please Contact your manager for futher questions.<br><br>Best regards,<br>Maventory";

            await _emailService.SendEmailAsync(userMail, subject, emailBody);
        }

        public async Task AssetRequestSent(string userMail, int assetId)
        {
            var subject = "Asset Request";
            var emailBody = $"Greetings Maventory,<br><br>An Asset Request for assetId {assetId} has been Recieved.";

            await _emailService.SendEmailAsync(userMail, subject, emailBody);
        }

        //SERVICE REQUEST NOTIFICATIONS
        
        public async Task ServiceRequestSent(string userMail, int assetId, int ServiceId, IssueType issueType)
        {
            var subject = "Service Request";
            var emailBody = $"Greetings Maventory,<br><br>An Service Request has been Raised for Asset Id {assetId} with Service Id {ServiceId} as {issueType.ToString()} .";

            await _emailService.SendEmailAsync(userMail, subject, emailBody);
        }

        public async Task ServiceRequestApproved(string userMail, string userName, int assetId, int ServiceId, IssueType issueType)
        {
            var subject = "Service Request Approved";
            var emailBody = $"Dear {userName},<br><br>Service Request {ServiceId} which have been Raised for {assetId} with {issueType.ToString()} has been Approved .<br><br>Best regards,<br>Maventory";

            await _emailService.SendEmailAsync(userMail, subject, emailBody);
        }

        public async Task ServiceRequestCompleted(string userMail, string userName, int assetId, int ServiceId, IssueType issueType)
        {
            var subject = "Service Request Completion";
            var emailBody = $"Dear {userName},<br><br>Service Request {ServiceId} which have been Raised for {assetId} with {issueType.ToString()} has been Completed and the Cost will be detained from salary .<br><br>Best regards,<br>Maventory";

            await _emailService.SendEmailAsync(userMail, subject, emailBody);
        }

        //RETURN REQUEST NOTIFICATIONS

        public async Task ReturnRequestSent(string userMail, int assetId, int ReturnId)
        {
            var subject = "Return Request";
            var emailBody = $"Greetings Maventory,<br><br>An Return Request has been Raised for {assetId} with {ReturnId} .";

            await _emailService.SendEmailAsync(userMail, subject, emailBody);
        }

        public async Task ReturnRequestApproved(string userMail, string userName, int assetId, int ReturnId)
        {
            var subject = "Return Request Approved";
            var emailBody = $"Dear {userName},<br><br>Return Request {ReturnId} which have been Raised for {assetId} has been Approved .<br><br>Best regards,<br>Maventory";

            await _emailService.SendEmailAsync(userMail, subject, emailBody);
        }

        public async Task ReturnRequestCompleted(string userMail, string userName, int assetId)
        {
            var subject = "Asset Returned";
            var emailBody = $"Dear {userName},<br><br>Thank you for returning the asset {assetId} .<br><br>Best regards,<br>Maventory";
            await _emailService.SendEmailAsync(userMail, subject, emailBody);
        }

        public async Task ReturnRequestRejected(string userMail, string userName, int assetId, int ReturnId)
        {
            var subject = "Return Request Declined";
            var emailBody = $"Dear {userName},<br><br>Return Request {ReturnId} which have been Raised for {assetId} has been Rejected .<br><br>Best regards,<br>Maventory";

            await _emailService.SendEmailAsync(userMail, subject, emailBody);
        }

        //User Added
        public async Task UserProfileCreated(string userMail, string userName, string Password)
        {
            var subject = "Maventory Profile";
            var emailBody = $"Dear {userName},<br><br>Your Profile has been created for Maventory Platform. Once You logs in please update your details for further procedures. <br><br>To Log into Maventory use http://localhost:5173/ <br><br>UserEmail : {userMail} <br><br>Password:{Password} <br><br>Best regards,<br>Maventory";


            await _emailService.SendEmailAsync(userMail, subject, emailBody);
        }

    }
}
