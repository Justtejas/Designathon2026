using Hexa_Hub.DTO;

namespace Hexa_Hub.Interface
{
    public interface IMaintenanceLogRepo
    {
        Task<List<MaintenanceClassDto>> GetAllLog();
        Task<List<MaintenanceLog>> GetAllMaintenanceLog();
        Task<MaintenanceClassDto> GetMaintenanceById(int id);
        Task<List<MaintenanceLog>> GetMaintenanceLogById(int userId);
        Task AddMaintenanceLog(MaintenanceLog maintenanceLog);
        Task<bool> UpdateMaintenanceLog(MaintenanceClassDto maintenanceClassDto);
        Task DeleteMaintenanceLog(int id);
        Task Save();

        Task<List<MaintenanceLog>> GetMaintenanceLogByUserId(int userId);
    }
}
