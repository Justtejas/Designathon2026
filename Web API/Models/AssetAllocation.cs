using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static Hexa_Hub.Models.MultiValues;

public class AssetAllocation
{
    [Required]
    [Key]
    public int allocationId { get; set; }

    [Required]
    public int assetId { get; set; }

    [Required]
    public int userId { get; set; }

    [Required]
    public int assetReqId { get; set; }

    [Required]
    [DataType(DataType.Date)]
    [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
    public DateTime allocatedDate { get; set; } = DateTime.Now;

    //Navigation Properties
    // 1 - 1 Relation

    public User? User { get; set; }

    public Asset? Asset { get; set; }   

    public AssetRequest? AssetRequests { get; set; }
}
