using Hexa_Hub.Interface;
using Microsoft.EntityFrameworkCore;
using Hexa_Hub.Exceptions;
using Hexa_Hub.DTO;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;


namespace Hexa_Hub.Repository
{
    public class MaintenanceLogRepo : IMaintenanceLogRepo
    {
        private readonly DataContext _context;

        public MaintenanceLogRepo(DataContext context)
        {
            _context = context;
        }
        public async Task<List<MaintenanceClassDto>> GetAllLog()
        {
            return await _context.MaintenanceLogs
                .Include(ml => ml.Asset)
                .Include(ml => ml.User)
                .Select(ml => new MaintenanceClassDto
                {
                    maintenanceId = ml.maintenanceId,
                    assetId = ml.Asset.assetId,
                    assetName = ml.Asset.assetName,
                    userId = ml.User.userId,
                    userName = ml.User.userName,
                    maintenanceDate = ml.maintenanceDate,
                    Cost = ml.Cost,
                    maintenanceDescription = ml.maintenanceDescription,
                })
                .OrderByDescending(ml=>ml.maintenanceDate)
                .ToListAsync();
        }

        public async Task<List<MaintenanceLog>> GetAllMaintenanceLog()
        {
            return await _context.MaintenanceLogs
                .Include(ml => ml.Asset)
                .Include(ml => ml.User)
                .ToListAsync();
        }
      

        public async Task<MaintenanceClassDto> GetMaintenanceById(int id)
        {
            return await _context.MaintenanceLogs
                .Include(ml => ml.Asset)
                .Include(ml => ml.User)
                .Select(ml=> new MaintenanceClassDto
                {
                    maintenanceId = ml.maintenanceId,
                    assetId = ml.Asset.assetId,
                    assetName = ml.Asset.assetName,
                    userId = ml.User.userId,
                    userName = ml.User.userName,
                    maintenanceDate = ml.maintenanceDate,
                    Cost = ml.Cost,
                    maintenanceDescription = ml.maintenanceDescription,
                })
                .FirstOrDefaultAsync(ml => ml.maintenanceId == id);
        }

        public async Task<List<MaintenanceLog>> GetMaintenanceLogById(int userId)
        {
            return await _context.MaintenanceLogs
                .Include(ml => ml.Asset)
                .Include(ml => ml.User)
                .Where(ml => ml.userId == userId)
                .ToListAsync();
        }

        public async Task AddMaintenanceLog(MaintenanceLog maintenanceLog)
        {
            _context.MaintenanceLogs.AddAsync(maintenanceLog);
        }

        public async Task DeleteMaintenanceLog(int id)
        {
            var log = await _context.MaintenanceLogs.FindAsync(id);
            if (log == null)
            {
                throw new MaintenanceLogNotFoundException($"Maintenance Log with ID {id} Not Found");
            }
            _context.MaintenanceLogs.Remove(log);

        }

        public async Task Save()
        {
            await _context.SaveChangesAsync();
        }

        //public async Task<bool> UpdateMaintenanceLog(int id, MaintenanceDto maintenanceDto)
        //{
        //    var existingLog = await _context.MaintenanceLogs.FindAsync(id);
        //    if (existingLog == null)
        //    {
        //        return false;
        //    }

        //    existingLog.maintenanceDate = maintenanceDto.maintenanceDate;
        //    existingLog.Cost = maintenanceDto.Cost;
        //    existingLog.maintenanceDescription = maintenanceDto.maintenanceDescription;

        //    _context.MaintenanceLogs.Update(existingLog);

        //    return true;
        //}

        public async Task<bool> UpdateMaintenanceLog(MaintenanceClassDto maintenanceClassDto)
        {
            var existingLog = await _context.MaintenanceLogs.FindAsync(maintenanceClassDto.maintenanceId);
            if (existingLog == null)
            {
                return false;
            }

            existingLog.maintenanceDate = maintenanceClassDto.maintenanceDate;
            existingLog.Cost = maintenanceClassDto.Cost;
            existingLog.maintenanceDescription = maintenanceClassDto.maintenanceDescription;

            _context.MaintenanceLogs.Update(existingLog);
            return true;
        }




        public async Task<List<MaintenanceLog>> GetMaintenanceLogByuserId(int userId)
        {
            return await _context.MaintenanceLogs
                .Where(ml => ml.userId == userId)
                .Include(ml => ml.Asset)
                .Include(ml => ml.User)
                .ToListAsync();
        }
    }
}
