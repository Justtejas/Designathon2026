using static Hexa_Hub.Models.MultiValues;

namespace Hexa_Hub.Interface
{
    public interface INotificationService
    {
        Task SendAllocationApproved(string UserMail, string UserName, string AssetName, int assetId);
        Task SendAllocationRejected(string UserMail, string UserName, string AssetName, int assetId);
        Task SendAudit(string UserMail, string UserName, int AuditId);
        Task AduitCompleted(string UserMail, int AuditId);
        Task ServiceRequestSent(string UserMail, int AssetId, int ServiceId, IssueType issueType);
        Task ServiceRequestApproved(string UserMail, string UserName, int AssetId, int ServiceId, IssueType issueType);
        Task ServiceRequestCompleted(string UserMail, string UserName, int AssetId, int ServiceId, IssueType issueType);
        Task ReturnRequestSent(string UserMail, int AssetId, int ReturnId);
        Task ReturnRequestApproved(string UserMail, string UserName, int AssetId, int ReturnId);
        Task ReturnRequestRejected(string UserMail, string UserName, int AssetId, int ReturnId);
        Task ReturnRequestCompleted(string UserMail, string UserName, int AssetId);

        Task AssetRequestSent(string UserMail, int assetId);

        Task UserProfileCreated(string UserMail, string UserName, string Password);
        Task AuditInProgress(string UserMail, int AuditId);



    }
}
