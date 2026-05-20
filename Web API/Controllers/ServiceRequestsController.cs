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
using static Hexa_Hub.Models.MultiValues;

namespace Hexa_Hub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServiceRequestsController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly IServiceRequest _serviceRequest;
        private readonly IMaintenanceLogRepo _maintenanceLog;
        private readonly INotificationService _notificationService;

        public ServiceRequestsController(DataContext context, IServiceRequest serviceRequest, IMaintenanceLogRepo maintenanceLog, INotificationService notificationService)
        {
            _context = context;
            _serviceRequest = serviceRequest;
            _maintenanceLog = maintenanceLog;
            _notificationService = notificationService;
        }

        //// GET: api/ServiceRequests

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<ServiceClassDto>>> GetServiceRequests()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.userIdentifier));
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            if (userRole == "Admin")
            {
                return Ok(await _serviceRequest.GetAllServiceRequests());
            }
            else
            {
                var userRequests = await _serviceRequest.GetServiceRequestsByuserId(userId);
                if (userRequests == null || !userRequests.Any())
                {
                    return NotFound($"No service requests found for the logged-in user {userId}.");
                }
                return Ok(userRequests);
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutServiceRequest(int id, ServiceClassDto serviceRequestDto)
        {
            // Validate the ID
            if (id != serviceRequestDto.serviceId)
            {
                return BadRequest($"Given IDs {id} and {serviceRequestDto.serviceId} don't match.");
            }

            // Fetch existing request
            var existingRequest = await _serviceRequest.GetServiceRequestById(id);
            if (existingRequest == null)
            {
                return NotFound($"Service request with ID {id} not found.");
            }

            // Update properties
            existingRequest.assetId = serviceRequestDto.assetId;
            existingRequest.userId = serviceRequestDto.userId;
            existingRequest.serviceRequestDate = serviceRequestDto.serviceRequestDate;
            existingRequest.issueType = serviceRequestDto.issueType;
            existingRequest.serviceDescription = serviceRequestDto.serviceDescription;

            // Parse and update status
            if (Enum.TryParse(serviceRequestDto.serviceReqStatus.ToString(), out serviceReqStatus parsedStatus))
            {
                existingRequest.serviceReqStatus = parsedStatus;

                if (parsedStatus == serviceReqStatus.Approved)
                {
                    var asset = await _context.Assets.FindAsync(serviceRequestDto.assetId);
                    if (asset != null)
                    {
                        asset.assetStatus = assetStatus.UnderMaintenance;
                        _context.Entry(asset).State = EntityState.Modified;
                    }


                    var user = await _context.Users.FindAsync(serviceRequestDto.userId);
                    if (user != null)
                    {
                        await _notificationService.ServiceRequestApproved(user.userMail, user.userName, serviceRequestDto.assetId, id, serviceRequestDto.issueType);
                    }
                    var maintenanceLog = new MaintenanceLog
                    {
                        assetId = serviceRequestDto.assetId,
                        userId = serviceRequestDto.userId,
                        maintenanceDate = DateTime.Now,
                        maintenanceDescription = serviceRequestDto.serviceDescription
                    };
                    _maintenanceLog.AddMaintenanceLog(maintenanceLog);
                    await _maintenanceLog.Save();
                }
                else if (parsedStatus == serviceReqStatus.Completed)
                {
                    var asset = await _context.Assets.FindAsync(serviceRequestDto.assetId);
                    if (asset != null)
                    {
                        asset.assetStatus = assetStatus.Allocated;
                        _context.Entry(asset).State = EntityState.Modified;
                    }

                    var user = await _context.Users.FindAsync(serviceRequestDto.userId);
                    if (user != null)
                    {
                        await _notificationService.ServiceRequestCompleted(user.userMail, user.userName, serviceRequestDto.assetId, id, serviceRequestDto.issueType);
                    }
                }
                //else if(parsedStatus == serviceReqStatus.Rejected)
                //{

                //}
            }
            else
            {
                return BadRequest("Invalid serviceReqStatus value.");
            }

            // Update the database
            try
            {
                _serviceRequest.UpdateServiceRequest(existingRequest);
                await _serviceRequest.Save();
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ServiceRequestExists(id))
                {
                    return NotFound($"Details for the request ID {id} not found.");
                }
                else
                {
                    throw;
                }
            }

            return Ok("Data modified successfully");
        }


        //// PUT: api/ServiceRequests/5
        //// To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        //[HttpPut("{id}")]
        //[Authorize(Roles = "Admin")]
        //public async Task<IActionResult> PutServiceRequest(int id, ServiceRequestDto serviceRequestDto)
        //{
        //    if (id != serviceRequestDto.serviceId)
        //    {
        //        return BadRequest($"Given Id's {id} and {serviceRequestDto.serviceId} don't match");
        //    }

        //    var existingRequest = await _serviceRequest.GetServiceRequestById(id);
        //    if (existingRequest == null)
        //    {
        //        return NotFound($"Service request with ID {id} not found.");
        //    }

        //    existingRequest.assetId = serviceRequestDto.assetId;
        //    existingRequest.userId = serviceRequestDto.userId;
        //    existingRequest.serviceRequestDate = serviceRequestDto.serviceRequestDate;
        //    existingRequest.issueType = serviceRequestDto.issueType;
        //    existingRequest.serviceDescription = serviceRequestDto.serviceDescription;

        //    if (Enum.TryParse(serviceRequestDto.serviceReqStatus, out serviceReqStatus parsedStatus))
        //    {
        //        existingRequest.serviceReqStatus = parsedStatus;

        //        if (parsedStatus == serviceReqStatus.Approved)
        //        {
        //            var asset = await _context.Assets.FindAsync(serviceRequestDto.assetId);
        //            if (asset != null)
        //            {
        //                asset.assetStatus = assetStatus.UnderMaintenance;
        //                _context.Entry(asset).State = EntityState.Modified;
        //            }
        //            var user = await _context.Users.FindAsync(serviceRequestDto.userId);
        //            if (user != null)
        //            {
        //                await _notificationService.ServiceRequestApproved(user.userMail, user.userName, serviceRequestDto.assetId, id, serviceRequestDto.issueType);
        //            }
        //        }
        //        else if (parsedStatus == serviceReqStatus.Completed)
        //        {
        //            var asset = await _context.Assets.FindAsync(serviceRequestDto.assetId);
        //            if (asset != null)
        //            {
        //                asset.assetStatus = assetStatus.Allocated;
        //                _context.Entry(asset).State = EntityState.Modified;
        //            }
        //            var user = await _context.Users.FindAsync(serviceRequestDto.userId);
        //            if (user != null)
        //            {
        //                await _notificationService.ServiceRequestCompleted(user.userMail, user.userName, serviceRequestDto.assetId, id, serviceRequestDto.issueType);
        //            }
        //        }
        //    }
        //    else
        //    {
        //        return BadRequest("Invalid serviceReqStatus value");
        //    }

        //    try
        //    {
        //        _serviceRequest.UpdateServiceRequest(existingRequest);
        //        await _serviceRequest.Save();
        //        await _context.SaveChangesAsync();
        //    }
        //    catch (DbUpdateConcurrencyException)
        //    {
        //        if (!ServiceRequestExists(id))
        //        {
        //            return NotFound($"Details for the request ID {id} not found.");
        //        }
        //        else
        //        {
        //            throw;
        //        }
        //    }

        //    return Ok("Data modified successfully");
        //}


        // POST: api/ServiceRequests
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = "Executive")]
        public async Task<ActionResult<ServiceRequest>> PostServiceRequest(ServiceRequestDto serviceRequestDto)
        {
            var loggedInuserId = int.Parse(User.FindFirst(ClaimTypes.userIdentifier)?.Value);
            serviceRequestDto.userId = loggedInuserId;
            var serviceRequest = new ServiceRequest
            {
                assetId = serviceRequestDto.assetId,
                userId = loggedInuserId,
                serviceRequestDate = serviceRequestDto.serviceRequestDate,
                issueType = serviceRequestDto.issueType,
                serviceDescription = serviceRequestDto.serviceDescription
            };
            await _serviceRequest.AddServiceRequest(serviceRequest);
            await _serviceRequest.Save();

            //var maintenanceLog = new MaintenanceLog
            //{
            //    assetId = serviceRequest.assetId,
            //    userId = loggedInuserId,
            //    maintenanceDate = DateTime.Now,
            //    maintenanceDescription = serviceRequest.serviceDescription
            //};

            //_maintenanceLog.AddMaintenanceLog(maintenanceLog);
            //await _maintenanceLog.Save();

            return CreatedAtAction("GetServiceRequests", new { id = serviceRequest.serviceId }, serviceRequest);
        }


        // DELETE: api/ServiceRequests/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Executive")]
        public async Task<IActionResult> DeleteServiceRequest(int id)
        {
            try
            {
                var loggedInuserId = int.Parse(User.FindFirst(ClaimTypes.userIdentifier)?.Value);
                var serviceRequest = await _serviceRequest.GetServiceRequestById(id);
                if (serviceRequest == null)
                {
                    return NotFound("Id's Mismatch"); 
                }
                if (serviceRequest.userId != loggedInuserId )
                {
                    return Forbid("You are not able to Delete"); 
                }
                if(serviceRequest.serviceReqStatus == serviceReqStatus.Approved || serviceRequest.serviceReqStatus == serviceReqStatus.Completed)
                {
                    return BadRequest($"The Service Id {id} for USer {loggedInuserId} is already been {serviceRequest.serviceReqStatus}");
                }

                await _serviceRequest.DeleteServiceRequest(id);
                await _serviceRequest.Save();

                return Ok("Deletion Of Data Occured");
            }
            catch (AssetNotFoundException ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("Status/{status}")]
        public async Task<IActionResult> GetServiceRequestsByStatus(serviceReqStatus status)
        {
            try
            {
                var serviceRequests = await _serviceRequest.GetServiceReqByStatus(status);
                if (serviceRequests == null)
                {
                    return NotFound("No service requests found with the given status.");
                }

                return Ok(serviceRequests);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private bool ServiceRequestExists(int id)
        {
            return _context.ServiceRequests.Any(e => e.serviceId == id);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<AssetRequestClassDto>> GetServiceRequestById(int id)
        {
            var requestDto = await _serviceRequest.GetServiceById(id);
            return Ok(requestDto);
        }
    }
}
