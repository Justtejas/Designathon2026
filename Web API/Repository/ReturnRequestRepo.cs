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
                ReturnId = returnRequestDto.ReturnId,
                UserId = returnRequestDto.UserId,
                AssetId = returnRequestDto.AssetId,
                CategoryId = returnRequestDto.CategoryId,
                ReturnDate = returnRequestDto.ReturnDate,
                Reason = returnRequestDto.Reason,
                Condition = returnRequestDto.Condition
            };
            await _context.AddAsync(req);
            var adminUsers = await _userRepo.GetUsersByAdmin();

           
            foreach (var admin in adminUsers)
            {

                await _notificationService.ReturnRequestSent(admin.UserMail, returnRequestDto.AssetId, req.ReturnId);
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
                    ReturnId = rr.ReturnId,
                    UserId = rr.UserId,
                    UserName = rr.User.UserName,
                    AssetName = rr.Asset.AssetName,
                    AssetId = rr.AssetId,
                    CategoryId = rr.CategoryId,
                    CategoryName = rr.Asset.Category.CategoryName,
                    ReturnDate = rr.ReturnDate,
                    Reason = rr.Reason,
                    Condition = rr.Condition,
                    ReturnStatus = rr.ReturnStatus ?? Models.MultiValues.ReturnReqStatus.Sent,
                })
                .OrderByDescending(rr=>rr.ReturnDate)
                .ToListAsync();
        }

        public async Task<ReturnRequest?> GetReturnRequestById(int id)
        {
            return await _context.ReturnRequests
                .Include(rr => rr.Asset)
                .Include(rr => rr.User)
                .FirstOrDefaultAsync(rr => rr.ReturnId == id);
        }

        public async Task<ReturnClassDto?> GetReturnRequestId(int id)
        {
            return await _context.ReturnRequests
                .Include(rr => rr.Asset)
                .ThenInclude(a => a.Category)
                .Include(rr => rr.User)
                .Select(rr => new ReturnClassDto
                {
                    ReturnId = rr.ReturnId,
                    UserId = rr.UserId,
                    UserName = rr.User.UserName,
                    AssetName = rr.Asset.AssetName,
                    AssetId = rr.AssetId,
                    CategoryId = rr.CategoryId,
                    CategoryName = rr.Asset.Category.CategoryName,
                    ReturnDate = rr.ReturnDate,
                    Reason = rr.Reason,
                    Condition = rr.Condition,
                    //ReturnStatus = rr.ReturnStatus,
                    ReturnStatus = rr.ReturnStatus ?? Models.MultiValues.ReturnReqStatus.Sent,
                })
                .FirstOrDefaultAsync(rr => rr.ReturnId == id);
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
            var existingRequest = _context.ReturnRequests.Find(returnRequest.ReturnId);
            if (existingRequest != null)
            {
                _context.Entry(existingRequest).CurrentValues.SetValues(returnRequest);
                _context.Entry(existingRequest).State = EntityState.Modified;
            }
        }

        public async Task<List<ReturnClassDto>> GetReturnRequestsByUserId(int userId)
        {
            return await _context.ReturnRequests
                .Where(rr => rr.UserId == userId)
                .Include(rr => rr.Asset)
                .Include(rr => rr.User)
                .Select(rr => new ReturnClassDto
                {
                    ReturnId = rr.ReturnId,
                    UserId = rr.UserId,
                    UserName = rr.User.UserName,
                    AssetName = rr.Asset.AssetName,
                    AssetId = rr.AssetId,
                    CategoryId = rr.CategoryId,
                    CategoryName = rr.Asset.Category.CategoryName,
                    ReturnDate = rr.ReturnDate,
                    Reason = rr.Reason,
                    Condition = rr.Condition,
                    ReturnStatus = rr.ReturnStatus ?? Models.MultiValues.ReturnReqStatus.Sent,
                })
                .ToListAsync();
        }


        public async Task<bool> UserHasAsset(int id)
        {
            return await _context.AssetAllocations
                 .AnyAsync(aa => aa.UserId == id);
        }
    }
}
