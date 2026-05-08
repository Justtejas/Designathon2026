using static Hexa_Hub.Models.MultiValues;

namespace Hexa_Hub.Interface
{
    public interface INotificationService
    {
        Task SendAllocationApproved(string userMail, string userName, string assetName, int assetId);
        Task SendAllocationRejected(string userMail, string userName, string assetName, int assetId);
        Task SendAudit(string userMail, string userName, int AuditId);
        Task AduitCompleted(string userMail, int AuditId);
        Task ServiceRequestSent(string userMail, int assetId, int ServiceId, IssueType issueType);
        Task ServiceRequestApproved(string userMail, string userName, int assetId, int ServiceId, IssueType issueType);
        Task ServiceRequestCompleted(string userMail, string userName, int assetId, int ServiceId, IssueType issueType);
        Task ReturnRequestSent(string userMail, int assetId, int ReturnId);
        Task ReturnRequestApproved(string userMail, string userName, int assetId, int ReturnId);
        Task ReturnRequestRejected(string userMail, string userName, int assetId, int ReturnId);
        Task ReturnRequestCompleted(string userMail, string userName, int assetId);

        Task AssetRequestSent(string userMail, int assetId);

        Task UserProfileCreated(string userMail, string userName, string Password);
        Task AuditInProgress(string userMail, int AuditId);



    }
}
