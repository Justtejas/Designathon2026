using System;
using Microsoft.EntityFrameworkCore;
using static Hexa_Hub.Models.MultiValues;

public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Asset> Assets { get; set; }
        public DbSet<AssetAllocation> AssetAllocations { get; set; }
        public DbSet<AssetRequest> AssetRequests { get; set; }
        public DbSet<Audit> Audits { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<SubCategory> SubCategories { get; set; }
        public DbSet<MaintenanceLog> MaintenanceLogs { get; set; }
        public DbSet<ReturnRequest> ReturnRequests { get; set; }
        public DbSet<ServiceRequest> ServiceRequests { get; set; }
        protected override void OnModelCreating(ModelBuilder ModelBuilder)
        {
            ModelBuilder.Entity<User>()
                .Property(r => r.User_Type)
                .HasConversion(
                    v => v.ToString(),
                    v => Enum.Parse<UserType>(v));

            ModelBuilder.Entity<Asset>()
                .Property(r => r.assetStatus)
                .HasConversion(
                    v => v.ToString(),
                    v => Enum.Parse<assetStatus>(v));

            ModelBuilder.Entity<AssetRequest>()
                .Property(r => r.requestStatus)
                .HasConversion(
                    v => v.ToString(),
                    v => Enum.Parse<requestStatus>(v));

            ModelBuilder.Entity<ReturnRequest>()
                .Property(r => r.returnStatus)
                .HasConversion(
                    v => v.ToString(),
                    v => Enum.Parse<ReturnReqStatus>(v));

            ModelBuilder.Entity<ServiceRequest>()
                .Property(r => r.serviceReqStatus)
                .HasConversion(
                    v => v.ToString(),
                    v => Enum.Parse<serviceReqStatus>(v));

            ModelBuilder.Entity<Audit>()
                .Property(r => r.auditStatus)
                .HasConversion(
                    v => v.ToString(),
                    v => Enum.Parse<auditStatus>(v));

            ModelBuilder.Entity<ServiceRequest>()
                .Property(r => r.issueType)
                .HasConversion(
                    v => v.ToString(),
                    v => Enum.Parse<issueType>(v));

        base.OnModelCreating(ModelBuilder);

            //Asset Configuration
            ModelBuilder.Entity<Asset>()
                .HasOne(a => a.Category)
                .WithMany(c => c.Assets)
                .HasForeignKey(a => a.categoryId)
                .OnDelete(DeleteBehavior.NoAction);

            ModelBuilder.Entity<Asset>()
                .HasOne(a => a.SubCategories)
                .WithMany(c => c.Assets)
                .HasForeignKey(a => a.subCategoryId)
                .OnDelete(DeleteBehavior.NoAction);

            ModelBuilder.Entity<Asset>()
                .Property(e => e.manufacturingDate)
                .HasColumnType("date");

        //AssetAlocation Configuration
        ModelBuilder.Entity<AssetAllocation>()
                .HasOne(aa => aa.Asset)
                .WithMany(a => a.AssetAllocations)
                .HasForeignKey(aa => aa.assetId)
                .OnDelete(DeleteBehavior.NoAction);

            ModelBuilder.Entity<AssetAllocation>()
                .HasOne(aa => aa.User)
                .WithMany(u => u.AssetAllocations)
                .HasForeignKey(aa => aa.userId)
                .OnDelete(DeleteBehavior.NoAction);

            ModelBuilder.Entity<AssetAllocation>()
                .HasOne(aa => aa.AssetRequests)
                .WithOne(ar => ar.AssetAlocation)
                .HasForeignKey<AssetAllocation>(aa => aa.assetReqId)
                .OnDelete(DeleteBehavior.NoAction);

            //Audit Configuration
            ModelBuilder.Entity<Audit>()
                .HasOne(au => au.Asset)
                .WithMany(a => a.Audits)
                .HasForeignKey(au => au.assetId)
                .OnDelete(DeleteBehavior.NoAction);

            ModelBuilder.Entity<Audit>()
                .HasOne(au => au.User)
                .WithMany(u => u.Audits)
                .HasForeignKey(au => au.userId)
                .OnDelete(DeleteBehavior.NoAction);

            //AssetRequest Configuration
            ModelBuilder.Entity<AssetRequest>()
                .HasOne(ar => ar.Asset)
                .WithMany(a => a.AssetRequests)
                .HasForeignKey(ar => ar.assetId)
                .OnDelete(DeleteBehavior.NoAction);

            ModelBuilder.Entity<AssetRequest>()
                .HasOne(ar => ar.User)
                .WithMany(u => u.AssetRequests)
                .HasForeignKey(ar => ar.userId)
                .OnDelete(DeleteBehavior.NoAction);

            //MaintenanceLog Configuration
            ModelBuilder.Entity<MaintenanceLog>()
                .HasOne(m => m.Asset)
                .WithMany(a => a.MaintenanceLogs)
                .HasForeignKey(m => m.assetId)
                .OnDelete(DeleteBehavior.NoAction);

            ModelBuilder.Entity<MaintenanceLog>()
            .HasOne(m => m.User)
            .WithMany(u => u.MaintenanceLogs)
            .HasForeignKey(m => m.userId)
            .OnDelete(DeleteBehavior.NoAction);

            //ReturnReq Configuration
            ModelBuilder.Entity<ReturnRequest>()
                .HasOne(rr => rr.Asset)
                .WithMany(a => a.ReturnRequests)
                .HasForeignKey(rr => rr.assetId)
                .OnDelete(DeleteBehavior.NoAction);

            ModelBuilder.Entity<ReturnRequest>()
                .HasOne(rr => rr.User)
                .WithMany(u => u.ReturnRequests)
                .HasForeignKey(rr => rr.userId)
                .OnDelete(DeleteBehavior.NoAction);

            //ServiceReq Configuration
            ModelBuilder.Entity<ServiceRequest>()
                .HasOne(rr => rr.Asset)
                .WithMany(a => a.ServiceRequests)
                .HasForeignKey(rr => rr.assetId)
                .OnDelete(DeleteBehavior.NoAction);

            ModelBuilder.Entity<ServiceRequest>()
                .HasOne(rr => rr.User)
                .WithMany(u => u.ServiceRequests)
                .HasForeignKey(rr => rr.userId)
                .OnDelete(DeleteBehavior.NoAction);

            //SubCategory Configuration
            ModelBuilder.Entity<SubCategory>()
                .HasOne(sc => sc.Category)
                .WithMany(c => c.SubCategories)
                .HasForeignKey(sc => sc.categoryId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }


