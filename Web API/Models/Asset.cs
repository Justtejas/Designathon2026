using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel;
using static Hexa_Hub.Models.MultiValues;

public class Asset
{
    [Required]
    [Key]
    public int assetId { get; set; }

    [Required]
    [MaxLength(55)]
    public string assetName { get; set; }

    public string? assetDescription { get; set; }

    [Required]
    public int categoryId { get; set; }

    [Required]
    public int subCategoryId { get; set; }

    public byte[]? assetImage { get; set; }

    [Required]
    public string serialNumber { get; set; }

    [Required]
    public string Model { get; set; }

    [Required]
    [DataType(DataType.Date)]
    [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
    public DateTime manufacturingDate {  get; set; }    
   
    [Required]
    [MaxLength(55)]
    public string Location { get; set; }

    [Required]
    public decimal Value { get; set; }

    [DataType(DataType.Date)]
    [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
    public DateTime? expiryDate { get; set; }

    [DefaultValue(assetStatus.OpenToRequest)]
    public assetStatus? assetStatus { get; set; } = assetStatus.OpenToRequest;

    //Navigation Properties
    // 1 - 1 Relations

    public Category? Category { get; set; }

    public SubCategory? SubCategories { get; set; }


    // 1 - * Relations

    public ICollection<AssetRequest>? AssetRequests { get; set; } = new List<AssetRequest>();

    public ICollection<ServiceRequest>? ServiceRequests { get; set; } = new List<ServiceRequest>();

    public ICollection<MaintenanceLog>? MaintenanceLogs { get; set; } = new List<MaintenanceLog>();

    public ICollection<Audit>? Audits { get; set; } = new List<Audit>();

    public ICollection<ReturnRequest>? ReturnRequests { get; set; } = new List<ReturnRequest>();

    public ICollection<AssetAllocation>? AssetAllocations { get; set; } = new List<AssetAllocation>();
        
        




}
