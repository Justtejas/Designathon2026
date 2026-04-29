using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Hexa_Hub.Exceptions;
using Hexa_Hub.Interface;
using Hexa_Hub.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Hexa_Hub.DTO;
using Microsoft.EntityFrameworkCore;

namespace Hexa_Hub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AssetAllocationsController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly IAssetAllocation _assetallocation;

        public AssetAllocationsController(DataContext context, IAssetAllocation assetAllocation)
     
        {
            _context = context;
            _assetallocation = assetAllocation;
        }
        // GET: api/allocation/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<AllocationDto>>> GetAllocationsByUserId(int userId)
        {
            var allocations = await _assetallocation.GetAllocationsByUserIdAsync(userId);
            if (allocations == null || !allocations.Any())
            {
                return NotFound();
            }
            return Ok(allocations);
        }

        // GET: api/AssetAllocations
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<AllocationClassDto>>> GetAssetAllocations()
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
                var userRole = User.FindFirstValue(ClaimTypes.Role);
                if (userRole == "Admin")
                {
                    return await _assetallocation.GetAllAllocations();
                }
                else
                {
                    var userRequests = await _assetallocation.GetAllocationListById(userId);
                    if (userRequests == null || !userRequests.Any())
                    {
                        throw new AllocationNotFoundException($"No Allocation can be found for the User {userId}");
                    }
                    return Ok(userRequests);
                }
            }
            catch (AllocationNotFoundException ex)
            {
                throw new AllocationNotFoundException(ex.Message);
            }
        }

        // GET: api/AssetAllocation/filter-by-month?monthName=January
        [HttpGet("filter-by-month")]
        public async Task<IActionResult> FilterAllocationsByMonth(string month)
        {
            // Validate that the month name is not null or empty
            if (string.IsNullOrEmpty(month))
            {
                return BadRequest("Month name is required.");
            }

            try
            {
                var allocations = await _assetallocation.GetAllocationsByMonthAsync(month);

                if (allocations == null || !allocations.Any())
                {
                    throw new AllocationNotFoundException($"No allocations found for the month of {month}.");
                }

                return Ok(allocations);
            }
            catch (FormatException)
            {
                return BadRequest("Invalid month name. Please provide a valid month name (e.g., January, February).");
            }
        }

        // GET: api/AssetAllocation/filter-by-year?year=2024
        [HttpGet("filter-by-year")]
        public async Task<IActionResult> FilterAllocationsByYear(int year)
        {
            if (year < 1900 || year > DateTime.Now.Year)
            {
                return BadRequest("Invalid year. Please provide a valid year.");
            }

            var allocations = await _assetallocation.GetAllocationsByYearAsync(year);

            if (allocations == null || !allocations.Any())
            {
                return NotFound($"No allocations found for the year {year}.");
            }

            return Ok(allocations);
        }

        // GET: api/AssetAllocation/filter-by-month-and-year?month=January&year=2024
        [HttpGet("filter-by-month-and-year")]
        public async Task<IActionResult> FilterAllocationsByMonthAndYear(string month, int year)
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
                var allocations = await _assetallocation.GetAllocationsByMonthAndYearAsync(month, year);

                if (allocations == null || !allocations.Any())
                {
                   return NotFound($"No allocations found for the month of {month} in the year {year}.");
                }

                return Ok(allocations);
            }
            catch (FormatException)
            {
                return BadRequest("Invalid month name. Please provide a valid month name (e.g., January, February).");
            }
        }

        // GET: api/AssetAllocation/filter-by-date-range?startDate=2024-01-01&endDate=2024-12-31
        [HttpGet("filter-by-date-range")]
        public async Task<IActionResult> FilterAllocationsByDateRange(DateTime startDate, DateTime endDate)
        {
            if (startDate > endDate)
            {
                return BadRequest("Start date cannot be greater than end date.");
            }

            var allocations = await _assetallocation.GetAllocationsByDateRangeAsync(startDate, endDate);

            if (allocations == null || !allocations.Any())
            {
                throw new AllocationNotFoundException($"No allocations found between {startDate.ToString("yyyy-MM-dd")} and {endDate.ToString("yyyy-MM-dd")}.");
            }

            return Ok(allocations);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetAssetAllocationById(int id)
        {
            var asset = await _assetallocation.GetAllocationById(id);
            return Ok(asset);
        }
    }
}

