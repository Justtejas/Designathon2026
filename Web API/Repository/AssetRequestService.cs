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
                    assetReqId = ar.assetReqId,
                    userName = ar.User.userName,
                    userId = ar.User.userId,
                    assetId = ar.Asset.assetId,
                    assetName =ar.Asset.assetName,
                    categoryName = ar.Asset.Category.categoryName,
                    assetReqDate = ar.assetReqDate,
                    assetReqReason = ar.assetReqReason,
                    requestStatus = ar.requestStatus ?? requestStatus.Pending,
                })
                .OrderByDescending(ar => ar.assetReqDate)
                .ToListAsync();
        }
        public async Task<List<AssetRequest>> GetAssetRequestByMonthAsync(string month)
        {
            _log.LogInfo("Fetching Asset Requests by month");

            var monthname = DateTime.ParseExact(month, "MMMM", null).Month;
            return await _context.AssetRequests
                                 .Where(a => a.assetReqDate.Month == monthname)
                                 .ToListAsync();
        }

        public async Task<List<AssetRequest>> GetAssetRequestByYearAsync(int year)
        {
            _log.LogInfo("Fetching Asset Requests by year");

            return await _context.AssetRequests
                                 .Where(a => a.assetReqDate.Year == year)
                                 .ToListAsync();
        }

        public async Task<List<AssetRequest>> GetAssetRequestByMonthAndYearAsync(string month, int year)
        {
            _log.LogInfo("Fetching Asset Requests Month and Year");

            var monthname = DateTime.ParseExact(month, "MMMM", null).Month;
            return await _context.AssetRequests
                                 .Where(a => a.assetReqDate.Month == monthname && a.assetReqDate.Year == year)
                                 .ToListAsync();
        }

        public async Task<List<AssetRequest>> GetAssetRequestByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            _log.LogInfo("Fetching Asset Requests date range");

            return await _context.AssetRequests
                                 .Where(a => a.assetReqDate>= startDate && a.assetReqDate <= endDate)
                                 .ToListAsync();
        }

        public async Task<IEnumerable<AssetRequestDto>> GetAssetRequestByStatus(requestStatus status)
        {
            _log.LogInfo("Fetching Asset Requests by status");

            var reqByStatus = await (from request in _context.AssetRequests
                                        where request.requestStatus == status
                                        select new AssetRequestDto
                                        {
                                            assetReqId = request.assetReqId,
                                            userId = request.userId,
                                            assetId = request.assetId,
                                            categoryId = request.categoryId,
                                            assetReqDate = request.assetReqDate,
                                            assetReqReason= request.assetReqReason, 
                                            requestStatus = request.requestStatus.ToString()
                                           
                                        }).ToListAsync();

            return reqByStatus;
        }


        //public async Task<List<AssetRequest>> GetAssetRequestsByuserId(int userId)
        //{
        //    return await _context.AssetRequests
        //        .Where(sr => sr.userId == userId)
        //        .Include(sr => sr.Asset)
        //        .Include(sr => sr.User)
        //        .ToListAsync();
        //}

        public async Task<List<AssetRequestClassDto>> GetAssetRequestsByuserId(int userId)
        {
            _log.LogInfo("Fetching Asset Requests by user id");

            return await _context.AssetRequests
                .Where(sr => sr.userId == userId)
                .Include(sr => sr.Asset)
                .Include(sr => sr.User)
                .Select(ar => new AssetRequestClassDto
                {
                    assetReqId = ar.assetReqId,
                    userName = ar.User.userName,
                    userId = ar.User.userId,
                    assetId = ar.Asset.assetId,
                    assetName = ar.Asset.assetName,
                    categoryName = ar.Asset.Category.categoryName,
                    assetReqDate = ar.assetReqDate,
                    assetReqReason = ar.assetReqReason,
                    requestStatus = ar.requestStatus ?? requestStatus.Pending,
                })
                .ToListAsync();
        }

        public async Task<AssetRequest?> GetAssetRequestById(int id)
        {
            _log.LogInfo("Fetching Asset Requests by id");

            return await _context.AssetRequests
                .Include(ar => ar.Asset)
                .Include(ar => ar.User)
                .FirstOrDefaultAsync(u => u.assetReqId == id);
        }

        public async Task<AssetRequestClassDto> GetAssetRequestId(int id)
        {
            _log.LogInfo("Fetching Asset Requests by id");

            return await _context.AssetRequests
                .Include(ar => ar.Asset)
                .Include(ar => ar.User)
                .Select(ar => new AssetRequestClassDto
                {
                    assetReqId = ar.assetReqId,
                    userName = ar.User.userName,
                    userId = ar.User.userId,
                    assetName = ar.Asset.assetName,
                    categoryName = ar.Asset.Category.categoryName,
                    assetReqDate = ar.assetReqDate,
                    assetReqReason = ar.assetReqReason,
                    requestStatus = ar.requestStatus ?? requestStatus.Pending,
                    assetId = ar.Asset.assetId,
                })
                .FirstOrDefaultAsync(ar => ar.assetReqId == id);
        }

        public async Task AddAssetRequest(AssetRequestDto dto)
        {
            _log.LogInfo("Adding Asset Requests");

            var req = new AssetRequest
            {
                assetReqId = dto.assetReqId,
                userId = dto.userId,
                assetId = dto.assetId,
                categoryId = dto.categoryId,
                assetReqDate = dto.assetReqDate,
                assetReqReason = dto.assetReqReason
            };

            _context.AssetRequests.Add(req);
            var adminUsers = await _userRepo.GetUsersByAdmin();

            foreach (var admin in adminUsers)
            {

                await _notificationService.AssetRequestSent(admin.userMail,  req.assetId);
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

        //    if (assetRequestDto.requestStatus != existingRequest.requestStatus.ToString())
        //    {
        //        if (Enum.TryParse(assetRequestDto.requestStatus, out requestStatus parsedStatus))
        //        {
        //            existingRequest.requestStatus = parsedStatus;

        //            if (parsedStatus == requestStatus.Allocated)
        //             {
        //                var existingAllocId = await _context.AssetAllocations
        //                    .FirstOrDefaultAsync(aa => aa.assetReqId == assetRequestDto.assetReqId);

        //                if (existingAllocId == null)
        //                {
        //                    var assetAllocation = new AssetAllocation
        //                    {
        //                        assetId = assetRequestDto.assetId,
        //                        userId = assetRequestDto.userId,
        //                        assetReqId = assetRequestDto.assetReqId,
        //                        allocatedDate = DateTime.Now
        //                    };
        //                    await _assetAlloc.AddAllocation(assetAllocation);

        //                    var asset = await _asset.GetAssetById(assetRequestDto.assetId);
        //                    if (asset != null)
        //                    {
        //                        asset.assetStatus = assetStatus.Allocated;
        //                        _asset.UpdateAsset(asset);
        //                    }
        //                    var user = await _context.Users.FindAsync(assetRequestDto.userId);
        //                    if (user == null)
        //                    {
        //                        throw new ArgumentException("User not found.");
        //                    }
        //                    else
        //                    {
        //                        await _notificationService.SendAllocationApproved(
        //                            user.userMail,
        //                            user.userName,
        //                            asset.assetName,
        //                            asset.assetId);
        //                    }
        //                }
        //            }
        //            else if(parsedStatus == requestStatus.Rejected)
        //            {
        //                var asset = await _asset.GetAssetById(assetRequestDto.assetId);
        //                if (asset != null)
        //                {
        //                    var user = await _context.Users.FindAsync(assetRequestDto.userId);
        //                    if (user == null)
        //                    {
        //                        throw new ArgumentException("User not found.");
        //                    }
        //                    else
        //                    {
        //                        await _notificationService.SendAllocationRejected(
        //                            user.userMail,
        //                            user.userName,
        //                            asset.assetName,
        //                            asset.assetId);
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

            if (assetRequestDto.requestStatusName != existingRequest.requestStatus.ToString())
            {
                if (Enum.TryParse(assetRequestDto.requestStatusName, out requestStatus parsedStatus))
                {
                    existingRequest.requestStatus = parsedStatus;

                    switch (parsedStatus)
                    {
                        case requestStatus.Allocated:
                            await HandleAllocation(assetRequestDto, existingRequest);
                            _log.LogInfo("allocated Asset Requests");
                            break;

                        case requestStatus.Rejected:
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
                .FirstOrDefaultAsync(aa => aa.assetReqId == assetRequestDto.assetReqId);

            if (existingAllocId == null)
            {
                var assetAllocation = new AssetAllocation
                {
                    assetId = assetRequestDto.assetId,
                    userId = assetRequestDto.userId,
                    assetReqId = assetRequestDto.assetReqId,
                    allocatedDate = DateTime.Now
                };

                await _assetAlloc.AddAllocation(assetAllocation);

                var asset = await _asset.GetAssetById(assetRequestDto.assetId);
                if (asset != null)
                {
                    asset.assetStatus = assetStatus.Allocated;
                    _asset.UpdateAsset(asset);
                }

                var user = await _context.Users.FindAsync(assetRequestDto.userId);
                if (user == null)
                {
                    throw new ArgumentException("User not found.");
                }
                _log.LogInfo("Allocated Mail Asset Requests Sent");

                await _notificationService.SendAllocationApproved(
                    user.userMail,
                    user.userName,
                    asset.assetName,
                    asset.assetId);
            }
        }

        private async Task HandleRejection(UpdateRequestClassDto assetRequestDto)
        {
            _log.LogInfo("Rejected Asset Requests Process Started");

            var asset = await _asset.GetAssetById(assetRequestDto.assetId);
            if (asset != null)
            {
                var user = await _context.Users.FindAsync(assetRequestDto.userId);
                if (user == null)
                {
                    throw new ArgumentException("User not found.");
                }
                _log.LogInfo("Rejected Mail Asset Requests Sent");

                await _notificationService.SendAllocationRejected(
                    user.userMail,
                    user.userName,
                    asset.assetName,
                    asset.assetId);
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
