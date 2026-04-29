using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Hexa_Hub.DTO;
using Hexa_Hub.Exceptions;
using Hexa_Hub.Interface;
using Hexa_Hub.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hexa_Hub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaintenanceLogsController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly IMaintenanceLogRepo _maintenanceLogRepo;
        public MaintenanceLogsController(DataContext context, IMaintenanceLogRepo maintenanceLogRepo)
        {
            _context = context;
            _maintenanceLogRepo = maintenanceLogRepo;
        }
        [HttpGet("AllLog")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<MaintenanceClassDto>>> GetAllMaintenanceLog()
        {
            return await _maintenanceLogRepo.GetAllLog();
        }

        // GET: api/MaintenanceLogs
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<MaintenanceLog>>> GetMaintenanceLogs()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            if (userRole == "Admin")
            {
                return await _maintenanceLogRepo.GetAllMaintenanceLog();
            }
            else
            {
                var req = await _maintenanceLogRepo.GetMaintenanceLogByUserId(userId);
                if (req == null)
                {
                    return NotFound($"No maintenance has been for for user {userId}");
                }
                return Ok(req);
            }
        }

        [HttpGet("id/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<MaintenanceClassDto>> GetMaintenanceLogById(int id)
        {
            var maintenanceLog = await _maintenanceLogRepo.GetMaintenanceById(id);

            if (maintenanceLog == null)
            {
                return NotFound($"No maintenance log found with ID {id}.");
            }

            return Ok(maintenanceLog);
        }


        // GET: api/MaintenanceLogs/5
        [HttpGet("{userId}")]
        [Authorize(Roles ="Admin")]
        public async Task<ActionResult<MaintenanceLog>> GetMaintenanceLog(int userId)
        {

            var maintenanceLogs = await _maintenanceLogRepo.GetMaintenanceLogById(userId);


            if (maintenanceLogs == null)
            {
                return NotFound($"No maintenance has been for for user {userId}");
            }

            return Ok(maintenanceLogs);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutMaintenanceLog(int id, [FromBody] MaintenanceClassDto maintenanceClassDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Retrieve the existing log to update
                var existingLog = await _maintenanceLogRepo.GetMaintenanceById(id);
                if (existingLog == null)
                {
                    return NotFound($"No maintenance log found with ID {id}.");
                }

                // Update the fields
                existingLog.Maintenance_date = maintenanceClassDto.Maintenance_date;
                existingLog.Cost = maintenanceClassDto.Cost;
                existingLog.Maintenance_Description = maintenanceClassDto.Maintenance_Description;

                // Call the update method
                await _maintenanceLogRepo.UpdateMaintenanceLog(existingLog);

                // Save changes
                await _maintenanceLogRepo.Save();

                return Ok("Update successful");
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MaintenanceLogExists(id))
                {
                    return NotFound($"No maintenance log found with ID {id}.");
                }
                else
                {
                    throw;
                }
            }
        }

        //// PUT: api/MaintenanceLogs/5
        //[HttpPut("{id}")]
        //[Authorize(Roles = "Admin")]
        //public async Task<IActionResult> PutMaintenanceLog(int id, [FromBody] MaintenanceDto maintenanceDto)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }

        //    try
        //    {
        //        var result = await _maintenanceLogRepo.UpdateMaintenanceLog(id, maintenanceDto);
        //        if (!result)
        //        {
        //            return NotFound($"No maintenance has been for for user {id}");
        //        }
        //        await _maintenanceLogRepo.Save();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!MaintenanceLogExists(id))
        //        {
        //            return NotFound($"No maintenance has been for for user {id}");
        //        }
        //        else
        //        {
        //            throw;
        //        }
        //    }

        //    return Ok("Updation Success");
        //}

        // DELETE: api/MaintenanceLogs/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteMaintenanceLog(int id)
        {
            try
            {
                await _maintenanceLogRepo.DeleteMaintenanceLog(id);
                await _maintenanceLogRepo.Save();
                return Ok($"Deletion Occured for id {id}");
            }
            catch (MaintenanceLogNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private bool MaintenanceLogExists(int id)
        {
            return _context.MaintenanceLogs.Any(e => e.MaintenanceId == id);
        }
    }
}
