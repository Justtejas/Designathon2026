using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel;
using static Hexa_Hub.Models.MultiValues;

public class Asset
{
    [Required]
    [Key]
    public int AssetId { get; set; }

    [Required]
    [MaxLength(55)]
    public string AssetName { get; set; }

    public string? AssetDescription { get; set; }

    [Required]
    public int CategoryId { get; set; }

    [Required]
    public int SubCategoryId { get; set; }

    public byte[]? AssetImage { get; set; }

    [Required]
    public string SerialNumber { get; set; }

    [Required]
    public string Model { get; set; }

    [Required]
    [DataType(DataType.Date)]
    [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
    public DateTime ManufacturingDate {  get; set; }    
   
    [Required]
    [MaxLength(55)]
    public string Location { get; set; }

    [Required]
    public decimal Value { get; set; }

    [DataType(DataType.Date)]
    [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
    public DateTime? Expiry_Date { get; set; }

    [DefaultValue(AssetStatus.OpenToRequest)]
    public AssetStatus? Asset_Status { get; set; } = AssetStatus.OpenToRequest;

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
