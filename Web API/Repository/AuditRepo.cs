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
                    assetId = a.assetId,
                    assetName = a.Asset.assetName,
                    userId = a.userId,
                    userName = a.User.userName 
                })
                .ToListAsync();

            return allocatedAssets;
        }

        public async Task<Audit> AddAduit(AuditsDto auditDto)
        {
            var audit = new Audit
            {
                auditId = auditDto.auditId,
                assetId = auditDto.assetId,
                userId = auditDto.userId,
                auditDate = auditDto.auditDate,
                auditMessage = auditDto.auditMessage
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

            if (aId.auditStatus == Models.MultiValues.auditStatus.Completed)
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
                    auditId = a.auditId,
                    assetId = a.assetId,
                    userId = a.userId,
                    auditDate = a.auditDate,
                    auditMessage = a.auditMessage,
                    auditStatus = a.auditStatus == auditStatus.Completed ? "Completed" : a.auditStatus == auditStatus.InProgress ? "InProgress" : "Sent",
                    assetName = a.Asset.assetName,
                    userName = a.User.userName
                })
                .OrderByDescending(a => a.auditDate)
                .ToListAsync();
        }

        public async Task<List<AuditsDto>> GetAllAudit()
        {
            var audits =  await _context.Audits
                .Include(a => a.User)
                .Include(a => a.Asset)
                .OrderByDescending(a => a.auditDate)
                .Take(5)
                .ToListAsync();
            return audits.Select(a => new AuditsDto
            {
                auditId = a.auditId,
                assetId = a.assetId,
                userId = a.userId,
                auditDate = a.auditDate,
                auditMessage = a.auditMessage,
                auditStatus = a.auditStatus == auditStatus.Completed ? "Completed" :
               a.auditStatus == auditStatus.InProgress ? "InProgress" : "Sent",
                assetName = a.Asset?.assetName,
                userName = a.User?.userName
            }).ToList();
        }
        public async Task<Audit?> GetAuditById(int id)
        {
            return await _context.Audits
                    .Include(a => a.User)
                    .Include(a => a.Asset)
                    .FirstOrDefaultAsync(a=>a.auditId == id);
        }

        public async Task<AuditsDto?> GetauditId(int id)
        {
            return await _context.Audits
                    .Include(a => a.User)
                    .Include(a => a.Asset)
                    .Select(a => new AuditsDto
                    {
                        auditId = a.auditId,
                        assetId = a.assetId,
                        userId = a.userId,
                        auditDate = a.auditDate,
                        auditMessage = a.auditMessage,
                        auditStatus = a.auditStatus == auditStatus.Completed ? "Completed" :
               a.auditStatus == auditStatus.InProgress ? "InProgress" : "Sent",
                        assetName = a.Asset.assetName,
                        userName = a.User.userName
                    })
                    .FirstOrDefaultAsync(a => a.auditId == id);
        }

        //public async Task<List<Audit>> GetAuditsByuserId(int userId)
        //{
        //    return await _context.Audits
        //        .Where(a => a.userId == userId)
        //        .Include(a => a.Asset)
        //        .Include(a => a.User)
        //        .ToListAsync();
        //}

        public async Task<List<AuditsDto>> GetAuditsByuserId(int userId)
        {
            return await _context.Audits
                .Where(a => a.userId == userId)
                .Include(a => a.Asset)
                .Include(a => a.User)
                .Select(a => new AuditsDto
                {
                    auditId = a.auditId,
                    assetId = a.assetId,
                    userId = a.userId,
                    auditDate = a.auditDate,
                    auditMessage = a.auditMessage,
                    auditStatus = a.auditStatus == auditStatus.Completed ? "Completed" :
               a.auditStatus == auditStatus.InProgress ? "InProgress" : "Sent",
                    assetName = a.Asset.assetName,
                    userName = a.User.userName
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
