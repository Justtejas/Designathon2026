using Hexa_Hub.Interface;
using Microsoft.EntityFrameworkCore;
using Hexa_Hub.Exceptions;
using Hexa_Hub.DTO;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Hexa_Hub.Repository
{
    public class ReturnRequestRepo : IReturnReqRepo
    {
        private readonly DataContext _context;
        private readonly IUserRepo _userRepo;
        private readonly INotificationService _notificationService;
        public ReturnRequestRepo(DataContext context, IUserRepo userRepo, INotificationService notificationService)
        {
            _context = context;
            _userRepo = userRepo;
            _notificationService = notificationService;
        }
        public async Task<ReturnRequest> AddReturnRequest(ReturnRequestDto returnRequestDto)
        {
            var req = new ReturnRequest
            {
                returnId = returnRequestDto.returnId,
                userId = returnRequestDto.userId,
                assetId = returnRequestDto.assetId,
                categoryId = returnRequestDto.categoryId,
                returnDate = returnRequestDto.returnDate,
                Reason = returnRequestDto.Reason,
                Condition = returnRequestDto.Condition
            };
            await _context.AddAsync(req);
            var adminUsers = await _userRepo.GetUsersByAdmin();

           
            foreach (var admin in adminUsers)
            {

                await _notificationService.ReturnRequestSent(admin.userMail, returnRequestDto.assetId, req.returnId);
            }
            return req;
        }

        public async Task DeleteReturnRequest(int id)
        {
            var req = await _context.ReturnRequests.FindAsync(id);
            if (req == null)
                throw new ReturnRequestNotFoundException($"Return Request with ID {id} Not Found");
            _context.ReturnRequests.Remove(req);
        }

        public async Task<List<ReturnClassDto>> GetAllReturnRequest()
        {
            return await _context.ReturnRequests
                .Include(rr => rr.Asset)
                .Include(rr => rr.User)
                .Select(rr=>new ReturnClassDto
                {
                    returnId = rr.returnId,
                    userId = rr.userId,
                    userName = rr.User.userName,
                    assetName = rr.Asset.assetName,
                    assetId = rr.assetId,
                    categoryId = rr.categoryId,
                    categoryName = rr.Asset.Category.categoryName,
                    returnDate = rr.returnDate,
                    Reason = rr.Reason,
                    Condition = rr.Condition,
                    returnStatus = rr.returnStatus ?? Models.MultiValues.ReturnReqStatus.Sent,
                })
                .OrderByDescending(rr=>rr.returnDate)
                .ToListAsync();
        }

        public async Task<ReturnRequest?> GetReturnRequestById(int id)
        {
            return await _context.ReturnRequests
                .Include(rr => rr.Asset)
                .Include(rr => rr.User)
                .FirstOrDefaultAsync(rr => rr.returnId == id);
        }

        public async Task<ReturnClassDto?> GetReturnRequestId(int id)
        {
            return await _context.ReturnRequests
                .Include(rr => rr.Asset)
                .ThenInclude(a => a.Category)
                .Include(rr => rr.User)
                .Select(rr => new ReturnClassDto
                {
                    returnId = rr.returnId,
                    userId = rr.userId,
                    userName = rr.User.userName,
                    assetName = rr.Asset.assetName,
                    assetId = rr.assetId,
                    categoryId = rr.categoryId,
                    categoryName = rr.Asset.Category.categoryName,
                    returnDate = rr.returnDate,
                    Reason = rr.Reason,
                    Condition = rr.Condition,
                    //returnStatus = rr.returnStatus,
                    returnStatus = rr.returnStatus ?? Models.MultiValues.ReturnReqStatus.Sent,
                })
                .FirstOrDefaultAsync(rr => rr.returnId == id);
        }

        public async Task Save()
        {
            await _context.SaveChangesAsync();
        }

        //public void UpdateReturnRequest(ReturnClassDto returnRequest)
        //{
        //    _context.Attach(returnRequest);
        //    _context.Entry(returnRequest).State = EntityState.Modified;
        //}
        public void UpdateReturnRequest(ReturnClassDto returnRequest)
        {
            var existingRequest = _context.ReturnRequests.Find(returnRequest.returnId);
            if (existingRequest != null)
            {
                _context.Entry(existingRequest).CurrentValues.SetValues(returnRequest);
                _context.Entry(existingRequest).State = EntityState.Modified;
            }
        }

        public async Task<List<ReturnClassDto>> GetReturnRequestsByuserId(int userId)
        {
            return await _context.ReturnRequests
                .Where(rr => rr.userId == userId)
                .Include(rr => rr.Asset)
                .Include(rr => rr.User)
                .Select(rr => new ReturnClassDto
                {
                    returnId = rr.returnId,
                    userId = rr.userId,
                    userName = rr.User.userName,
                    assetName = rr.Asset.assetName,
                    assetId = rr.assetId,
                    categoryId = rr.categoryId,
                    categoryName = rr.Asset.Category.categoryName,
                    returnDate = rr.returnDate,
                    Reason = rr.Reason,
                    Condition = rr.Condition,
                    returnStatus = rr.returnStatus ?? Models.MultiValues.ReturnReqStatus.Sent,
                })
                .ToListAsync();
        }


        public async Task<bool> UserHasAsset(int id)
        {
            return await _context.AssetAllocations
                 .AnyAsync(aa => aa.userId == id);
        }
    }
}
