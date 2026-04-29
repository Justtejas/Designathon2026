using Hexa_Hub.Interface;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Hexa_Hub.Exceptions;
using Hexa_Hub.DTO;
using NuGet.ContentModel;
using static Hexa_Hub.Models.MultiValues;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Hexa_Hub.Repository
{
    public class AuditRepo : IAuditRepo
    {
        private readonly DataContext _context;

        public AuditRepo(DataContext context)
        {
            _context = context;
        }
        public async Task<List<AllocatedAssetDto>> GetAllocatedAssetsAsync()
        {
            var allocatedAssets = await _context.AssetAllocations
                .Select(a => new AllocatedAssetDto
                {
                    AssetId = a.AssetId,
                    AssetName = a.Asset.AssetName,
                    UserId = a.UserId,
                    UserName = a.User.UserName 
                })
                .ToListAsync();

            return allocatedAssets;
        }

        public async Task<Audit> AddAduit(AuditsDto auditDto)
        {
            var audit = new Audit
            {
                AuditId = auditDto.AuditId,
                AssetId = auditDto.AssetId,
                UserId = auditDto.UserId,
                AuditDate = auditDto.AuditDate,
                AuditMessage = auditDto.AuditMessage
            };
            await _context.AddAsync(audit);


            return audit;
        }

        public async Task DeleteAuditReq(int id)
        {
            
            var aId = await _context.Audits.FindAsync(id);
            if (aId == null)
            {
                throw new AuditNotFoundException($"Audit with ID {id} Not Found");
            }

            if (aId.Audit_Status == Models.MultiValues.AuditStatus.Completed)
            {
                throw new InvalidOperationException("Cannot Delete an Completed Audit");
            }
            _context.Audits.Remove(aId);
            
        }

        public async Task<List<AuditsDto>> GetAllAudits()
        {
            return await _context.Audits
                .Include(a=>a.User)
                .Include(a=>a.Asset)
                .Select(a => new AuditsDto
                {
                    AuditId = a.AuditId,
                    AssetId = a.AssetId,
                    UserId = a.UserId,
                    AuditDate = a.AuditDate,
                    AuditMessage = a.AuditMessage,
                    Audit_Status = a.Audit_Status == AuditStatus.Completed ? "Completed" : a.Audit_Status == AuditStatus.InProgress ? "InProgress" : "Sent",
                    AssetName = a.Asset.AssetName,
                    UserName = a.User.UserName
                })
                .OrderByDescending(a => a.AuditDate)
                .ToListAsync();
        }

        public async Task<List<AuditsDto>> GetAllAudit()
        {
            var audits =  await _context.Audits
                .Include(a => a.User)
                .Include(a => a.Asset)
                .OrderByDescending(a => a.AuditDate)
                .Take(5)
                .ToListAsync();
            return audits.Select(a => new AuditsDto
            {
                AuditId = a.AuditId,
                AssetId = a.AssetId,
                UserId = a.UserId,
                AuditDate = a.AuditDate,
                AuditMessage = a.AuditMessage,
                Audit_Status = a.Audit_Status == AuditStatus.Completed ? "Completed" :
               a.Audit_Status == AuditStatus.InProgress ? "InProgress" : "Sent",
                AssetName = a.Asset?.AssetName,
                UserName = a.User?.UserName
            }).ToList();
        }
        public async Task<Audit?> GetAuditById(int id)
        {
            return await _context.Audits
                    .Include(a => a.User)
                    .Include(a => a.Asset)
                    .FirstOrDefaultAsync(a=>a.AuditId == id);
        }

        public async Task<AuditsDto?> GetAuditId(int id)
        {
            return await _context.Audits
                    .Include(a => a.User)
                    .Include(a => a.Asset)
                    .Select(a => new AuditsDto
                    {
                        AuditId = a.AuditId,
                        AssetId = a.AssetId,
                        UserId = a.UserId,
                        AuditDate = a.AuditDate,
                        AuditMessage = a.AuditMessage,
                        Audit_Status = a.Audit_Status == AuditStatus.Completed ? "Completed" :
               a.Audit_Status == AuditStatus.InProgress ? "InProgress" : "Sent",
                        AssetName = a.Asset.AssetName,
                        UserName = a.User.UserName
                    })
                    .FirstOrDefaultAsync(a => a.AuditId == id);
        }

        //public async Task<List<Audit>> GetAuditsByUserId(int userId)
        //{
        //    return await _context.Audits
        //        .Where(a => a.UserId == userId)
        //        .Include(a => a.Asset)
        //        .Include(a => a.User)
        //        .ToListAsync();
        //}

        public async Task<List<AuditsDto>> GetAuditsByUserId(int userId)
        {
            return await _context.Audits
                .Where(a => a.UserId == userId)
                .Include(a => a.Asset)
                .Include(a => a.User)
                .Select(a => new AuditsDto
                {
                    AuditId = a.AuditId,
                    AssetId = a.AssetId,
                    UserId = a.UserId,
                    AuditDate = a.AuditDate,
                    AuditMessage = a.AuditMessage,
                    Audit_Status = a.Audit_Status == AuditStatus.Completed ? "Completed" :
               a.Audit_Status == AuditStatus.InProgress ? "InProgress" : "Sent",
                    AssetName = a.Asset.AssetName,
                    UserName = a.User.UserName
                })
                .ToListAsync();
        }

        public async Task Save()
        {
            await _context.SaveChangesAsync();
        }

        public Task<Audit> UpdateAudit(Audit audit)
        {
            _context.Audits.Update(audit);
            return Task.FromResult(audit);
        }
    }
}
