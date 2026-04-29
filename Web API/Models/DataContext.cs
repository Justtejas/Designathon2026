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
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .Property(r => r.User_Type)
                .HasConversion(
                    v => v.ToString(),
                    v => Enum.Parse<UserType>(v));

            modelBuilder.Entity<Asset>()
                .Property(r => r.Asset_Status)
                .HasConversion(
                    v => v.ToString(),
                    v => Enum.Parse<AssetStatus>(v));

            modelBuilder.Entity<AssetRequest>()
                .Property(r => r.Request_Status)
                .HasConversion(
                    v => v.ToString(),
                    v => Enum.Parse<RequestStatus>(v));

            modelBuilder.Entity<ReturnRequest>()
                .Property(r => r.ReturnStatus)
                .HasConversion(
                    v => v.ToString(),
                    v => Enum.Parse<ReturnReqStatus>(v));

            modelBuilder.Entity<ServiceRequest>()
                .Property(r => r.ServiceReqStatus)
                .HasConversion(
                    v => v.ToString(),
                    v => Enum.Parse<ServiceReqStatus>(v));

            modelBuilder.Entity<Audit>()
                .Property(r => r.Audit_Status)
                .HasConversion(
                    v => v.ToString(),
                    v => Enum.Parse<AuditStatus>(v));

            modelBuilder.Entity<ServiceRequest>()
                .Property(r => r.Issue_Type)
                .HasConversion(
                    v => v.ToString(),
                    v => Enum.Parse<IssueType>(v));

        base.OnModelCreating(modelBuilder);

            //Asset Configuration
            modelBuilder.Entity<Asset>()
                .HasOne(a => a.Category)
                .WithMany(c => c.Assets)
                .HasForeignKey(a => a.CategoryId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Asset>()
                .HasOne(a => a.SubCategories)
                .WithMany(c => c.Assets)
                .HasForeignKey(a => a.SubCategoryId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Asset>()
                .Property(e => e.ManufacturingDate)
                .HasColumnType("date");

        //AssetAlocation Configuration
        modelBuilder.Entity<AssetAllocation>()
                .HasOne(aa => aa.Asset)
                .WithMany(a => a.AssetAllocations)
                .HasForeignKey(aa => aa.AssetId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<AssetAllocation>()
                .HasOne(aa => aa.User)
                .WithMany(u => u.AssetAllocations)
                .HasForeignKey(aa => aa.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<AssetAllocation>()
                .HasOne(aa => aa.AssetRequests)
                .WithOne(ar => ar.AssetAlocation)
                .HasForeignKey<AssetAllocation>(aa => aa.AssetReqId)
                .OnDelete(DeleteBehavior.NoAction);

            //Audit Configuration
            modelBuilder.Entity<Audit>()
                .HasOne(au => au.Asset)
                .WithMany(a => a.Audits)
                .HasForeignKey(au => au.AssetId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Audit>()
                .HasOne(au => au.User)
                .WithMany(u => u.Audits)
                .HasForeignKey(au => au.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            //AssetRequest Configuration
            modelBuilder.Entity<AssetRequest>()
                .HasOne(ar => ar.Asset)
                .WithMany(a => a.AssetRequests)
                .HasForeignKey(ar => ar.AssetId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<AssetRequest>()
                .HasOne(ar => ar.User)
                .WithMany(u => u.AssetRequests)
                .HasForeignKey(ar => ar.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            //MaintenanceLog Configuration
            modelBuilder.Entity<MaintenanceLog>()
                .HasOne(m => m.Asset)
                .WithMany(a => a.MaintenanceLogs)
                .HasForeignKey(m => m.AssetId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<MaintenanceLog>()
            .HasOne(m => m.User)
            .WithMany(u => u.MaintenanceLogs)
            .HasForeignKey(m => m.UserId)
            .OnDelete(DeleteBehavior.NoAction);

            //ReturnReq Configuration
            modelBuilder.Entity<ReturnRequest>()
                .HasOne(rr => rr.Asset)
                .WithMany(a => a.ReturnRequests)
                .HasForeignKey(rr => rr.AssetId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<ReturnRequest>()
                .HasOne(rr => rr.User)
                .WithMany(u => u.ReturnRequests)
                .HasForeignKey(rr => rr.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            //ServiceReq Configuration
            modelBuilder.Entity<ServiceRequest>()
                .HasOne(rr => rr.Asset)
                .WithMany(a => a.ServiceRequests)
                .HasForeignKey(rr => rr.AssetId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<ServiceRequest>()
                .HasOne(rr => rr.User)
                .WithMany(u => u.ServiceRequests)
                .HasForeignKey(rr => rr.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            //SubCategory Configuration
            modelBuilder.Entity<SubCategory>()
                .HasOne(sc => sc.Category)
                .WithMany(c => c.SubCategories)
                .HasForeignKey(sc => sc.CategoryId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }


