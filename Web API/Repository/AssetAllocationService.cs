using Hexa_Hub.Interface;
using Microsoft.EntityFrameworkCore;
using Hexa_Hub.Exceptions;
using Hexa_Hub.DTO;
using static Hexa_Hub.Models.MultiValues;
using static Hexa_Hub.Repository.AssetAllocationService;
using System.Configuration;

namespace Hexa_Hub.Repository
{
    public class AssetAllocationService : IAssetAllocation
    {
        private readonly DataContext _context;
        private readonly IEmail _email;
        private readonly IConfiguration _configuration;  // For accessing appsettings

        public AssetAllocationService(DataContext context, IEmail email,IConfiguration configuration)
        {
            _context = context;
            _email = email;
            _configuration = configuration;
        }

        public async Task<List<AllocationClassDto>> GetAllAllocations()
        {
            return await _context.AssetAllocations
                .Include(aa=>aa.Asset)
                    .ThenInclude(asset => asset.Category)
                    .ThenInclude(category => category.SubCategories)    
                .Include(aa=>aa.User)
                .Select(aa=> new AllocationClassDto
                {
                    allocationId = aa.allocationId,
                    assetName = aa.Asset.assetName,
                    assetId = aa.Asset.assetId,
                    userId = aa.User.userId,
                    userName = aa.User.userName,
                    categoryName = aa.Asset.Category.categoryName,
                    subCategoryName = aa.Asset.SubCategories.subCategoryName,
                    assetReqDate = aa.AssetRequests.assetReqDate,
                    assetReqId = aa.assetReqId,
                    allocatedDate = aa.allocatedDate,
                })
                .OrderByDescending(aa => aa.allocatedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<AllocationDto>> GetAllocationsByuserIdAsync(int userId)
        {
            var allocations = await _context.AssetAllocations
                .Include(a => a.Asset) // Include the related Asset entity
                .Where(a => a.userId == userId)
                .Select(a => new AllocationDto
                {
                    userId = a.userId,
                    assetName = a.Asset.assetName,
                    assetId = a.Asset.assetId,
                    categoryName = a.Asset.Category.categoryName,
                    categoryId = a.Asset.Category.categoryId,
                    Value = a.asset.Value,
                    Model = a.Asset.Model,
                    allocatedDate = a.allocatedDate
                })
                .ToListAsync();

            return allocations;
        }


        public async Task<List<AssetAllocation>> GetAllocationsByMonthAsync(string month)
        {
            var month = DateTime.ParseExact(month, "MMMM", null).Month;
            return await _context.AssetAllocations
                                 .Where(a => a.allocatedDate.Month == month)
                                 .ToListAsync();
        }

        public async Task<List<AssetAllocation>> GetAllocationsByYearAsync(int year)
        {
            return await _context.AssetAllocations
                                 .Where(a => a.allocatedDate.Year == year)
                                 .ToListAsync();
        }

        public async Task<List<AssetAllocation>> GetAllocationsByMonthAndYearAsync(string month, int year)
        {
            var month = DateTime.ParseExact(month, "MMMM", null).Month;
            return await _context.AssetAllocations
                                 .Where(a => a.allocatedDate.Month == month && a.allocatedDate.Year == year)
                                 .ToListAsync();
        }

        public async Task<List<AssetAllocation>> GetAllocationsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.AssetAllocations
                                 .Where(a => a.allocatedDate >= startDate && a.allocatedDate <= endDate)
                                 .ToListAsync();
        }


        public async Task AddAllocation(AssetAllocation allocation)
        {
            try
            {
                _context.AssetAllocations.Add(allocation);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error Adding Allocation: {ex.Message}");
            }
        }

        public async Task DeleteAllocation(int id)
        {
            try
            {
                var allocation = await GetAllocById(id);
                if (allocation == null)
                {
                    throw new AllocationNotFoundException($"Allocation with ID {id} Not Found");
                }
                _context.AssetAllocations.Remove(allocation);
            }
            catch (AllocationNotFoundException ex)
            {
                throw new AllocationNotFoundException(ex.Message);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error Deleting the Allocation{ex.Message}");
            }
        }

        public async Task Save()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<AssetAllocation?> GetAllocById(int id)
        {
            return await _context.AssetAllocations
                .Include(aa => aa.Asset)
                    .ThenInclude(asset => asset.Category)
                    .ThenInclude(category => category.SubCategories)
                .Include(aa => aa.User)
                .FirstOrDefaultAsync(aa => aa.allocationId == id);
        }

        public async Task<AllocationClassDto?> GetAllocationById(int id)
        {
            return await _context.AssetAllocations
                .Include(aa => aa.Asset)
                    .ThenInclude(asset => asset.Category)
                    .ThenInclude(category => category.SubCategories)
                .Include(aa => aa.User)
                .Select(aa => new AllocationClassDto
                {
                    allocationId = aa.allocationId,
                    assetName = aa.Asset.assetName,
                    userName = aa.User.userName,
                    assetId = aa.Asset.assetId,
                    userId = aa.User.userId,
                    categoryName = aa.Asset.Category.categoryName,
                    subCategoryName = aa.Asset.SubCategories.subCategoryName,
                    assetReqDate = aa.AssetRequests.assetReqDate,
                    assetReqId = aa.assetReqId,
                    allocatedDate = aa.allocatedDate,
                })
                .FirstOrDefaultAsync(aa => aa.allocationId == id);
        }

        public async Task<List<AssetAllocation>> GetAllocationListById(int userId)
        {
            return await _context.AssetAllocations
                .Where(aa => aa.userId == userId)
                .Include(aa => aa.Asset)
                    .ThenInclude(asset => asset.Category)
                    .ThenInclude(category => category.SubCategories)
                .Include(aa => aa.User)
                .Include(aa => aa.AssetRequests)
            .ToListAsync();
        }



        //public async Task<AssetAllocation> AllocateAssetAsync(AssetAllocationDto allocationDto, int adminuserId)
        //{
        //    // Check if the asset exists
        //    var asset = await _context.Assets.FindAsync(allocationDto.assetId);
        //    if (asset == null)
        //    {
        //        throw new AssetNotFoundException("Asset not found.");
        //    }

        //    // Check if the user exists (executive to whom the asset is being allocated)
        //    var user = await _context.Users.FindAsync(allocationDto.userId);
        //    if (user == null)
        //    {
        //        throw new UserNotFoundException("User not found.");
        //    }

        //    // Check if the current user (admin) exists
        //    var admin = await _context.Users.FindAsync(adminuserId);
        //    if (admin == null || admin.User_Type != UserType.Admin)
        //    {
        //        throw new UnauthorizedAccessException("Only an admin can allocate assets.");
        //    }

        //    // Create the AssetAllocation entity
        //    var assetAllocation = new AssetAllocation
        //    {
        //        assetId = allocationDto.assetId,
        //        userId = allocationDto.userId,
        //        assetReqId = allocationDto.assetReqId,
        //        allocatedDate = DateTime.Now,
        //        Asset = asset,
        //        User = user
        //    };

        //    // Save the allocation to the database
        //    _context.AssetAllocations.Add(assetAllocation);
        //    await _context.SaveChangesAsync();

        //    // Admin details for email
        //    string fromEmail = admin.userMail;  // Admin's email
        //    string fromName = admin.userName;    // Admin's name

        //    // Executive details
        //    string toEmail = user.userMail;     // Executive's email
        //    string subject = "Asset Allocation Notification";
        //    string message = $"Dear {user.userName},<br>Your asset {asset.assetName} has been allocated successfully on {assetAllocation.allocatedDate}.";

        //    // Send email notification from Admin to Executive
        //    await _email.SendEmailAsync(fromEmail, fromName, toEmail, subject, message);

        //    return assetAllocation;
        //}
    }
}



    


