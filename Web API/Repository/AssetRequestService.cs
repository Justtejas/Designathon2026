using Hexa_Hub.Interface;
using Microsoft.EntityFrameworkCore;
using Hexa_Hub.Exceptions;
using Hexa_Hub.DTO;
using static Hexa_Hub.Models.MultiValues;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Hexa_Hub.Repository
{
    public class AssetRequestService : IAssetRequest
    {
        private readonly DataContext _context;
        private readonly IAssetAllocation _assetAlloc;
        private readonly IAsset _asset;
        private readonly IEmail _email;
        private readonly INotificationService _notificationService;
        private readonly IUserRepo _userRepo;
        private readonly iLoggerService _log;
        public AssetRequestService(DataContext context, IAssetAllocation assetAlloc, IAsset asset, IEmail email, INotificationService notificationService, IUserRepo userRepo, iLoggerService log)
        {
            _context = context;
            _assetAlloc = assetAlloc;
            _asset = asset;
            _email = email;
            _notificationService = notificationService;
            _userRepo = userRepo;
            _log = log;
        }

        public async Task<List<AssetRequestClassDto>> GetAllAssetRequests()
        {
            _log.LogInfo("Fetching Asset Requests");
            return await _context.AssetRequests
                .Include(ar => ar.Asset)
                .Include(ar => ar.User)
                .Select(ar => new AssetRequestClassDto
                {
                    AssetReqId = ar.AssetReqId,
                    UserName = ar.User.UserName,
                    UserId = ar.User.UserId,
                    AssetId = ar.Asset.AssetId,
                    AssetName =ar.Asset.AssetName,
                    CategoryName = ar.Asset.Category.CategoryName,
                    AssetReqDate = ar.AssetReqDate,
                    AssetReqReason = ar.AssetReqReason,
                    RequestStatus = ar.Request_Status ?? RequestStatus.Pending,
                })
                .OrderByDescending(ar => ar.AssetReqDate)
                .ToListAsync();
        }
        public async Task<List<AssetRequest>> GetAssetRequestByMonthAsync(string month)
        {
            _log.LogInfo("Fetching Asset Requests by month");

            var monthname = DateTime.ParseExact(month, "MMMM", null).Month;
            return await _context.AssetRequests
                                 .Where(a => a.AssetReqDate.Month == monthname)
                                 .ToListAsync();
        }

        public async Task<List<AssetRequest>> GetAssetRequestByYearAsync(int year)
        {
            _log.LogInfo("Fetching Asset Requests by year");

            return await _context.AssetRequests
                                 .Where(a => a.AssetReqDate.Year == year)
                                 .ToListAsync();
        }

        public async Task<List<AssetRequest>> GetAssetRequestByMonthAndYearAsync(string month, int year)
        {
            _log.LogInfo("Fetching Asset Requests Month and Year");

            var monthname = DateTime.ParseExact(month, "MMMM", null).Month;
            return await _context.AssetRequests
                                 .Where(a => a.AssetReqDate.Month == monthname && a.AssetReqDate.Year == year)
                                 .ToListAsync();
        }

        public async Task<List<AssetRequest>> GetAssetRequestByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            _log.LogInfo("Fetching Asset Requests date range");

            return await _context.AssetRequests
                                 .Where(a => a.AssetReqDate>= startDate && a.AssetReqDate <= endDate)
                                 .ToListAsync();
        }

        public async Task<IEnumerable<AssetRequestDto>> GetAssetRequestByStatus(RequestStatus status)
        {
            _log.LogInfo("Fetching Asset Requests by status");

            var reqByStatus = await (from request in _context.AssetRequests
                                        where request.Request_Status == status
                                        select new AssetRequestDto
                                        {
                                            AssetReqId = request.AssetReqId,
                                            UserId = request.UserId,
                                            AssetId = request.AssetId,
                                            CategoryId = request.CategoryId,
                                            AssetReqDate = request.AssetReqDate,
                                            AssetReqReason= request.AssetReqReason, 
                                            Request_Status = request.Request_Status.ToString()
                                           
                                        }).ToListAsync();

            return reqByStatus;
        }


        //public async Task<List<AssetRequest>> GetAssetRequestsByUserId(int userId)
        //{
        //    return await _context.AssetRequests
        //        .Where(sr => sr.UserId == userId)
        //        .Include(sr => sr.Asset)
        //        .Include(sr => sr.User)
        //        .ToListAsync();
        //}

        public async Task<List<AssetRequestClassDto>> GetAssetRequestsByUserId(int userId)
        {
            _log.LogInfo("Fetching Asset Requests by user id");

            return await _context.AssetRequests
                .Where(sr => sr.UserId == userId)
                .Include(sr => sr.Asset)
                .Include(sr => sr.User)
                .Select(ar => new AssetRequestClassDto
                {
                    AssetReqId = ar.AssetReqId,
                    UserName = ar.User.UserName,
                    UserId = ar.User.UserId,
                    AssetId = ar.Asset.AssetId,
                    AssetName = ar.Asset.AssetName,
                    CategoryName = ar.Asset.Category.CategoryName,
                    AssetReqDate = ar.AssetReqDate,
                    AssetReqReason = ar.AssetReqReason,
                    RequestStatus = ar.Request_Status ?? RequestStatus.Pending,
                })
                .ToListAsync();
        }

        public async Task<AssetRequest?> GetAssetRequestById(int id)
        {
            _log.LogInfo("Fetching Asset Requests by id");

            return await _context.AssetRequests
                .Include(ar => ar.Asset)
                .Include(ar => ar.User)
                .FirstOrDefaultAsync(u => u.AssetReqId == id);
        }

        public async Task<AssetRequestClassDto> GetAssetRequestId(int id)
        {
            _log.LogInfo("Fetching Asset Requests by id");

            return await _context.AssetRequests
                .Include(ar => ar.Asset)
                .Include(ar => ar.User)
                .Select(ar => new AssetRequestClassDto
                {
                    AssetReqId = ar.AssetReqId,
                    UserName = ar.User.UserName,
                    UserId = ar.User.UserId,
                    AssetName = ar.Asset.AssetName,
                    CategoryName = ar.Asset.Category.CategoryName,
                    AssetReqDate = ar.AssetReqDate,
                    AssetReqReason = ar.AssetReqReason,
                    RequestStatus = ar.Request_Status ?? RequestStatus.Pending,
                    AssetId = ar.Asset.AssetId,
                })
                .FirstOrDefaultAsync(ar => ar.AssetReqId == id);
        }

        public async Task AddAssetRequest(AssetRequestDto dto)
        {
            _log.LogInfo("Adding Asset Requests");

            var req = new AssetRequest
            {
                AssetReqId = dto.AssetReqId,
                UserId = dto.UserId,
                AssetId = dto.AssetId,
                CategoryId = dto.CategoryId,
                AssetReqDate = dto.AssetReqDate,
                AssetReqReason = dto.AssetReqReason
            };

            _context.AssetRequests.Add(req);
            var adminUsers = await _userRepo.GetUsersByAdmin();

            foreach (var admin in adminUsers)
            {

                await _notificationService.AssetRequestSent(admin.UserMail,  req.AssetId);
                _log.LogInfo("Asset Requests mail has been sent");

            }
        }

        //public async Task<AssetRequest> UpdateAssetRequest(int id, AssetRequestDto assetRequestDto)
        //{
        //    var existingRequest = await GetAssetRequestById(id);
        //    if (existingRequest == null)
        //    {
        //        throw new AssetRequestNotFoundException($"Asset request with ID {id} not found.");
        //    }

        //    if (assetRequestDto.Request_Status != existingRequest.Request_Status.ToString())
        //    {
        //        if (Enum.TryParse(assetRequestDto.Request_Status, out RequestStatus parsedStatus))
        //        {
        //            existingRequest.Request_Status = parsedStatus;

        //            if (parsedStatus == RequestStatus.Allocated)
        //             {
        //                var existingAllocId = await _context.AssetAllocations
        //                    .FirstOrDefaultAsync(aa => aa.AssetReqId == assetRequestDto.AssetReqId);

        //                if (existingAllocId == null)
        //                {
        //                    var assetAllocation = new AssetAllocation
        //                    {
        //                        AssetId = assetRequestDto.AssetId,
        //                        UserId = assetRequestDto.UserId,
        //                        AssetReqId = assetRequestDto.AssetReqId,
        //                        AllocatedDate = DateTime.Now
        //                    };
        //                    await _assetAlloc.AddAllocation(assetAllocation);

        //                    var asset = await _asset.GetAssetById(assetRequestDto.AssetId);
        //                    if (asset != null)
        //                    {
        //                        asset.Asset_Status = AssetStatus.Allocated;
        //                        _asset.UpdateAsset(asset);
        //                    }
        //                    var user = await _context.Users.FindAsync(assetRequestDto.UserId);
        //                    if (user == null)
        //                    {
        //                        throw new ArgumentException("User not found.");
        //                    }
        //                    else
        //                    {
        //                        await _notificationService.SendAllocationApproved(
        //                            user.UserMail,
        //                            user.UserName,
        //                            asset.AssetName,
        //                            asset.AssetId);
        //                    }
        //                }
        //            }
        //            else if(parsedStatus == RequestStatus.Rejected)
        //            {
        //                var asset = await _asset.GetAssetById(assetRequestDto.AssetId);
        //                if (asset != null)
        //                {
        //                    var user = await _context.Users.FindAsync(assetRequestDto.UserId);
        //                    if (user == null)
        //                    {
        //                        throw new ArgumentException("User not found.");
        //                    }
        //                    else
        //                    {
        //                        await _notificationService.SendAllocationRejected(
        //                            user.UserMail,
        //                            user.UserName,
        //                            asset.AssetName,
        //                            asset.AssetId);
        //                    }
        //                }
        //            }
        //        }
        //        else
        //        {
        //            throw new ArgumentException("Invalid Request Status provided.");
        //        }
        //    }
        //    await _context.SaveChangesAsync();
        //    return existingRequest;
        //}

        

        public async Task<AssetRequest> UpdateAssetRequest(int id, UpdateRequestClassDto assetRequestDto)
        {
            _log.LogInfo("Updating Asset Requests");

            var existingRequest = await GetAssetRequestById(id);
            if (existingRequest == null)
            {
                _log.LogDebug($"Asset Requests with {id} not found");

                throw new AssetRequestNotFoundException($"Asset request with ID {id} not found.");
            }

            if (assetRequestDto.RequestStatusName != existingRequest.Request_Status.ToString())
            {
                if (Enum.TryParse(assetRequestDto.RequestStatusName, out RequestStatus parsedStatus))
                {
                    existingRequest.Request_Status = parsedStatus;

                    switch (parsedStatus)
                    {
                        case RequestStatus.Allocated:
                            await HandleAllocation(assetRequestDto, existingRequest);
                            _log.LogInfo("allocated Asset Requests");
                            break;

                        case RequestStatus.Rejected:
                            await HandleRejection(assetRequestDto);
                            _log.LogInfo("Rejected Asset Requests");

                            break;

                        default:
                            _log.LogDebug("Invalid Asset Requests");

                            throw new ArgumentException("Invalid Request Status provided.");
                    }
                }
                else
                {
                    _log.LogDebug("Invalid Asset Requests");

                    throw new ArgumentException("Invalid Request Status provided.");
                }
            }

            await _context.SaveChangesAsync();
            return existingRequest;
        }

        private async Task HandleAllocation(UpdateRequestClassDto assetRequestDto, AssetRequest existingRequest)
        {
            _log.LogInfo("Allocation Asset Requests Process started");

            var existingAllocId = await _context.AssetAllocations
                .FirstOrDefaultAsync(aa => aa.AssetReqId == assetRequestDto.AssetReqId);

            if (existingAllocId == null)
            {
                var assetAllocation = new AssetAllocation
                {
                    AssetId = assetRequestDto.AssetId,
                    UserId = assetRequestDto.UserId,
                    AssetReqId = assetRequestDto.AssetReqId,
                    AllocatedDate = DateTime.Now
                };

                await _assetAlloc.AddAllocation(assetAllocation);

                var asset = await _asset.GetAssetById(assetRequestDto.AssetId);
                if (asset != null)
                {
                    asset.Asset_Status = AssetStatus.Allocated;
                    _asset.UpdateAsset(asset);
                }

                var user = await _context.Users.FindAsync(assetRequestDto.UserId);
                if (user == null)
                {
                    throw new ArgumentException("User not found.");
                }
                _log.LogInfo("Allocated Mail Asset Requests Sent");

                await _notificationService.SendAllocationApproved(
                    user.UserMail,
                    user.UserName,
                    asset.AssetName,
                    asset.AssetId);
            }
        }

        private async Task HandleRejection(UpdateRequestClassDto assetRequestDto)
        {
            _log.LogInfo("Rejected Asset Requests Process Started");

            var asset = await _asset.GetAssetById(assetRequestDto.AssetId);
            if (asset != null)
            {
                var user = await _context.Users.FindAsync(assetRequestDto.UserId);
                if (user == null)
                {
                    throw new ArgumentException("User not found.");
                }
                _log.LogInfo("Rejected Mail Asset Requests Sent");

                await _notificationService.SendAllocationRejected(
                    user.UserMail,
                    user.UserName,
                    asset.AssetName,
                    asset.AssetId);
            }
        }


        public async Task DeleteAssetRequest(int id)
        {
            _log.LogInfo("Deleteing Asset Requests Process Sent");

            var assetRequest = await _context.AssetRequests.FindAsync(id);
            if (assetRequest == null)
            {
                throw new AssetRequestNotFoundException($"Request with ID {id} Not Found");
            }
            _log.LogInfo("Deleted Asset Requests");

            _context.AssetRequests.Remove(assetRequest);

        }
        public async Task Save()
        {
            await _context.SaveChangesAsync();
        }
    }

}
