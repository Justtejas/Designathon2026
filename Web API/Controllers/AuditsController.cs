using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Hexa_Hub.DTO;
using Hexa_Hub.Exceptions;
using Hexa_Hub.Interface;
using Hexa_Hub.Repository;
using iText.Commons.Bouncycastle.Cert.Ocsp;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using static Hexa_Hub.Models.MultiValues;

namespace Hexa_Hub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuditsController : ControllerBase
    {
        private readonly IAuditRepo _auditRepo;
        private readonly DataContext _context;
        private readonly INotificationService _notificationService;
        private readonly IUserRepo _userRepo;

        public AuditsController(IAuditRepo auditRepo,DataContext context, INotificationService notificationService, IUserRepo userRepo)
        {
            _auditRepo = auditRepo;
            _context = context;
            _notificationService = notificationService;
            _userRepo = userRepo;
        }

        [HttpGet("allocated-assets")]
        public async Task<IActionResult> GetAllocatedAssets()
        {
            var allocatedAssets = await _auditRepo.GetAllocatedAssetsAsync();
            return Ok(allocatedAssets);
        }

        // GET: api/Audits
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<AuditsDto>>> GetAudits()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            if (userRole == "Admin")
            {
                return await _auditRepo.GetAllAudits();
            }
            else
            {
                var req = await _auditRepo.GetAuditsByUserId(userId);
                if (req == null)
                {
                    return NotFound("id not Found");
                }
                return Ok(req);
            }
        }

        [HttpGet("All")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<AuditsDto>>> GetAllAudits()
        {
            return await _auditRepo.GetAllAudit();
        }


        [HttpGet("Audis/{id}")]
        [Authorize]
        public async Task<ActionResult<Audit>> GetAuditsById(int id)
        {
            var audit = await _auditRepo.GetAuditId(id);
            return Ok(audit);
        }

        // GET: api/Audits/5
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Audit>> GetAudit(int id)
        {
            //User can see his own details whereas Admin can see all users details
            var userRole = User.FindFirstValue(ClaimTypes.Role);
            if (userRole == "Admin")
            {
                var audit = await _auditRepo.GetAuditById(id);
                if (audit == null)
                {
                    return NotFound("id not Found");
                }
                return audit;
            }
            else
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
                var audit = await _auditRepo.GetAuditById(userId);
                if (audit == null)
                {
                    return NotFound("id not Found");
                }
                return Ok(new List<Audit> { audit });
            }
        }
        // PUT: api/Audits/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [Authorize(Roles = "Employee")]
        public async Task<IActionResult> PutAudit(int id, [FromBody] AuditsDto auditDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != auditDto.AuditId)
            {
                return BadRequest("Audit ID mismatch.");
            }

            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var existingAudit = await _auditRepo.GetAuditById(id);
            if (existingAudit == null)
            {
                return NotFound("id not Found");
            }

            if (existingAudit.UserId != userId)
            {
                return Forbid($"Sorry you are not User {userId}");
            }
            existingAudit.AuditDate = auditDto.AuditDate;
            existingAudit.AuditMessage = auditDto.AuditMessage;
            if (Enum.TryParse<AuditStatus>(auditDto.Audit_Status, out var status))
            {
                existingAudit.Audit_Status = status;
            }
            else
            {
                return BadRequest($"Invalid Audit Status: {auditDto.Audit_Status}");
            }


            try
            {
                await _auditRepo.UpdateAudit(existingAudit);
                await _auditRepo.Save();
                if (existingAudit.Audit_Status == AuditStatus.Completed)
                {
                    var adminUsers = await _userRepo.GetUsersByAdmin();

                    foreach (var admin in adminUsers)
                    {

                        await _notificationService.AduitCompleted(admin.UserMail, existingAudit.AuditId);
                    }
                    var admins = await _userRepo.GetUsersByRole(UserType.Admin);
                }
                if (existingAudit.Audit_Status == AuditStatus.InProgress)
                {
                    var adminUsers = await _userRepo.GetUsersByAdmin();

                    foreach (var admin in adminUsers)
                    {

                        await _notificationService.AuditInProgress(admin.UserMail, existingAudit.AuditId);
                    }
                    var admins = await _userRepo.GetUsersByRole(UserType.Admin);
                }
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AuditExists(id))
                {
                    return NotFound("No Audit Exists");
                }
                else
                {
                    throw;
                }
            }

            return Ok("Audit Sent Successfully");
        }


        // POST: api/Audits
        [HttpPost]
        [Authorize(Roles ="Admin")]
        public async Task<ActionResult<Audit>> PostAudit(AuditsDto auditDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            var audit = await _auditRepo.AddAduit(auditDto);
            await _auditRepo.Save();
            var employee = await _userRepo.GetUserId(audit.UserId);
            if (employee != null)
            {
                await _notificationService.SendAudit(
                    employee.UserMail,
                    employee.UserName,
                    audit.AuditId
                );
            }
            else
            {
                return NotFound("Employee not found.");
            }
            return CreatedAtAction("GetAudit", new { id = audit.AuditId }, audit);
        }


        // DELETE: api/Audits/5
        [HttpDelete("{id}")]
        [Authorize(Roles ="Admin")]
        public async Task<IActionResult> DeleteAudit(int id)
        {
            try
            {
                
                await _auditRepo.DeleteAuditReq(id);
                await _auditRepo.Save();
                return Ok("Audit Deleted Successfully");
            }
            catch (AuditNotFoundException ex)
            {
                return NotFound(ex.Message);
            }

        }

        private bool AuditExists(int id)
        {
            return _context.Audits.Any(e => e.AuditId == id);
        }
    }
}
