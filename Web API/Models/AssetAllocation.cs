using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static Hexa_Hub.Models.MultiValues;

public class AssetAllocation
{
    [Required]
    [Key]
    public int AllocationId { get; set; }

    [Required]
    public int AssetId { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public int AssetReqId { get; set; }

    [Required]
    [DataType(DataType.Date)]
    [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
    public DateTime AllocatedDate { get; set; } = DateTime.Now;

    //Navigation Properties
    // 1 - 1 Relation

    public User? User { get; set; }

    public Asset? Asset { get; set; }   

    public AssetRequest? AssetRequests { get; set; }
}
