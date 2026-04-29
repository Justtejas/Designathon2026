using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Hexa_Hub.DTO;
using Hexa_Hub.Exceptions;
using Hexa_Hub.Interface;
using Hexa_Hub.Models;
using Hexa_Hub.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static Hexa_Hub.Models.MultiValues;


namespace Hexa_Hub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AssetRequestsController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly IAssetRequest _assetRequest;
        private readonly IAssetAllocation _assetAlloc;
        private readonly IAsset _asset;
        private readonly iLoggerService _log;
        public AssetRequestsController(DataContext context, IAssetRequest assetRequest, IAssetAllocation assetAlloc, IAsset asset, iLoggerService log)
        {
            _context = context;
            _assetRequest = assetRequest;
            _assetAlloc = assetAlloc;
            _asset = asset;
            _log = log;
        }

        // GET: api/AssetRequests
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<AssetRequestClassDto>>> GetAssetRequests()
        {
            //User can see his own details whereas Admin can see all users details
            _log.LogInfo("Fetching Asset Requests");
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            if (userRole == "Admin")
            {
                _log.LogInfo("Fetched Asset Requests");
                return await _assetRequest.GetAllAssetRequests();

            }
            else
            {
                var req = await _assetRequest.GetAssetRequestsByUserId(userId);
                if (req == null)
                {
                    _log.LogDebug("Asset Request Not Found");
                    return NotFound();
                }
                return Ok(req);
            }
        }


        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutAssetRequest(int id, [FromBody] UpdateRequestClassDto assetRequestDto)
        {
            _log.LogInfo("Update Asset Requests Process Started");
            if (id != assetRequestDto.AssetReqId)
            {
                _log.LogDebug("Asset Requests Id Doesnt match");
                return BadRequest(new { error = "Id doesn't match" });
            }

            var existingRequest = await _assetRequest.GetAssetRequestById(id);
            if (existingRequest == null)
            {
                _log.LogDebug("Asset Requests Id Doesnt match");

                return NotFound(new { error = "Request not found" });
            }

            if (existingRequest.Request_Status == RequestStatus.Allocated || existingRequest.Request_Status == RequestStatus.Rejected)
            {
                _log.LogDebug("Asset Requests Id Already allocated or Rejected");

                return BadRequest(new { error = $"The Request ID {id} has already been Allocated/Rejected and cannot be updated." });
            }

            try
            {
                await _assetRequest.UpdateAssetRequest(id, assetRequestDto);
                _log.LogInfo("Updated Asset Requests");

                return Ok(new { message = $"{assetRequestDto.AssetReqId} has been updated" });
            }
            catch (AssetRequestNotFoundException ex)
            {
                _log.LogError("Asset Requests Id Doesnt match", ex);

                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _log.LogError("Asset Requests Id Doesnt match", ex);

                return BadRequest(new { error = ex.Message });
            }
        }

      
        // POST: api/AssetRequests
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = "Employee")]
        public async Task<ActionResult<AssetRequest>> PostAssetRequest(AssetRequestDto assetRequestDto)
        {
            _log.LogInfo("Adding Asset Requests Process Started");

            var loggedInUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            assetRequestDto.UserId = loggedInUserId;
            if (assetRequestDto.UserId != loggedInUserId)
            {
                return Forbid("You can only create a request for yourself.");
            }
            var asset = await _asset.GetAssetById(assetRequestDto.AssetId);
            
            if (asset.Asset_Status == Models.MultiValues.AssetStatus.Allocated || asset.Asset_Status == Models.MultiValues.AssetStatus.UnderMaintenance)
            {
                _log.LogDebug("Asset Requests Id Already allocated");

                return StatusCode(403, "The Requested Asset is currently locked (Allocated to another user)");
            }

            await _assetRequest.AddAssetRequest(assetRequestDto);
            _log.LogInfo("Added Asset Requests");

            await _assetRequest.Save();


            return CreatedAtAction("GetAssetRequests", new { id = assetRequestDto.AssetReqId }, assetRequestDto);
        }

        // DELETE: api/AssetRequests/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Employee")]
        public async Task<IActionResult> DeleteAssetRequest(int id)
        {

            try
            {
                var loggedInUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var assetRequest = await _assetRequest.GetAssetRequestById(id);
                if (assetRequest == null)
                {
                    throw new AssetRequestNotFoundException($"AssetRequest for id {assetRequest} not found");
                }
                if (assetRequest.UserId != loggedInUserId)
                {
                    return Forbid("You are not allowed to Delete Request");
                }
                if(assetRequest.Request_Status == RequestStatus.Allocated)
                {
                    return Forbid("The Request has already been Allocated. Please raise an ticket in Return Section if the asset is not needed.");
                }
                await _assetRequest.DeleteAssetRequest(id);
                await _assetRequest.Save();
                return Ok("The Request Has Been Successfully Deleted");
            }
            catch (AssetRequestNotFoundException ex)
            {
                throw new AssetRequestNotFoundException(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        private bool AssetRequestExists(int id)
        {
            return _context.AssetRequests.Any(e => e.AssetReqId == id);
        }

        // GET: api/AssetRequest/filter-by-month?monthName=January
        [HttpGet("filter-by-month")]
        public async Task<IActionResult> FilterAssetRequestByMonth(string month)
        {
            // Validate that the month name is not null or empty
            if (string.IsNullOrEmpty(month))
            {
                return BadRequest("Month name is required.");
            }

            try
            {
                var requests = await  _assetRequest.GetAssetRequestByMonthAsync(month);

                if (requests == null || !requests.Any())
                {
                    throw new AssetRequestNotFoundException($"No requests found for the month of {month}.");
                }

                return Ok(requests);
            }
            catch (FormatException)
            {
                return BadRequest("Invalid month name. Please provide a valid month name (e.g., January, February).");
            }
        }

        // GET: api/AssetRequest/filter-by-year?year=2024
        [HttpGet("filter-by-year")]
        public async Task<IActionResult> FilterAssetRequestByYear(int year)
        {
            if (year < 1900 || year > DateTime.Now.Year)
            {
                return BadRequest("Invalid year. Please provide a valid year.");
            }

            var requests = await _assetRequest.GetAssetRequestByYearAsync(year);

            if (requests == null || !requests.Any())
            {
                return NotFound($"No request found for the year {year}.");
            }

            return Ok(requests);
        }

        // GET: api/AssetRequest/filter-by-month-and-year?month=January&year=2024
        [HttpGet("filter-by-month-and-year")]
        public async Task<IActionResult> FilterAssetRequestByMonthAndYear(string month, int year)
        {
            if (string.IsNullOrEmpty(month))
            {
                return BadRequest("Month name is required.");
            }

            if (year < 1900 || year > DateTime.Now.Year)
            {
                return BadRequest("Invalid year. Please provide a valid year.");
            }

            try
            {
                var requests = await _assetRequest.GetAssetRequestByMonthAndYearAsync(month, year);

                if (requests == null || !requests.Any())
                {
                    return NotFound($"No requests found for the month of {month} in the year {year}.");
                }

                return Ok(requests);
            }
            catch (FormatException)
            {
                return BadRequest("Invalid month name. Please provide a valid month name (e.g., January, February).");
            }
        }

        // GET: api/AssetRequest/filter-by-date-range?startDate=2024-01-01&endDate=2024-12-31
        [HttpGet("filter-by-date-range")]
        public async Task<IActionResult> FilterAssetRequestByDateRange(DateTime startDate, DateTime endDate)
        {
            if (startDate > endDate)
            {
                return BadRequest("Start date cannot be greater than end date.");
            }

            var requests = await _assetRequest.GetAssetRequestByDateRangeAsync(startDate, endDate);

            if (requests == null || !requests.Any())
            {
                throw new AssetRequestNotFoundException($"No requests found between {startDate.ToString("yyyy-MM-dd")} and {endDate.ToString("yyyy-MM-dd")}.");
            }

            return Ok(requests);
        }

        [HttpGet("Status")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<AssetRequestDto>>> GetAssetRequestByStatus([FromQuery] RequestStatus status)
        {
            var assetreqDtos = await _assetRequest.GetAssetRequestByStatus(status);

            if (assetreqDtos == null || !assetreqDtos.Any())
            {
                return NotFound($"No requests found with status '{status}'.");
            }

            return Ok(assetreqDtos);
        }


        [HttpGet("GetAll")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<AssetRequestClassDto>>> GetAllAssetRequests()
        {
            _log.LogInfo("Fetching Asset Requests");

            return await _assetRequest.GetAllAssetRequests();
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<AssetRequestClassDto>> GetAssetRequestById(int id)
        {
            _log.LogInfo("Fetching Asset Requests by id");

            var requestDto = await _assetRequest.GetAssetRequestId(id);
            return Ok(requestDto);
        }


    }
}
