using Hexa_Hub.DTO;

namespace Hexa_Hub.Interface
{
    public interface IAuditRepo
    {
        Task<List<AuditsDto>> GetAllAudits();
        Task<Audit?> GetAuditById(int id);
        Task<AuditsDto?> GetAuditId(int id);
        Task<List<AllocatedAssetDto>> GetAllocatedAssetsAsync();
        //Task AddAuditReq(Audit audit);
        Task<Audit> AddAduit(AuditsDto auditDto);
        Task<Audit> UpdateAudit(Audit audit);
        Task DeleteAuditReq(int id);
        Task Save();
        //Task<List<Audit>> GetAuditsByUserId(int userId);
        Task<List<AuditsDto>> GetAuditsByUserId(int userId);

        Task<List<AuditsDto>> GetAllAudit();
    }
}
