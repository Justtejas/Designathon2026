using static Hexa_Hub.Models.MultiValues;

namespace Hexa_Hub.Interface
{
    public interface INotificationService
    {
        Task SendAllocationApproved(string userMail, string userName, string assetName, int assetId);
        Task SendAllocationRejected(string userMail, string userName, string assetName, int assetId);
        Task SendAudit(string userMail, string userName, int auditId);
        Task AduitCompleted(string userMail, int auditId);
        Task ServiceRequestSent(string userMail, int assetId, int serviceId, issueType issueType);
        Task ServiceRequestApproved(string userMail, string userName, int assetId, int serviceId, issueType issueType);
        Task ServiceRequestCompleted(string userMail, string userName, int assetId, int serviceId, issueType issueType);
        Task ReturnRequestSent(string userMail, int assetId, int returnId);
        Task ReturnRequestApproved(string userMail, string userName, int assetId, int returnId);
        Task ReturnRequestRejected(string userMail, string userName, int assetId, int returnId);
        Task ReturnRequestCompleted(string userMail, string userName, int assetId);

        Task AssetRequestSent(string userMail, int assetId);

        Task UserProfileCreated(string userMail, string userName, string Password);
        Task AuditInProgress(string userMail, int auditId);



    }
}
