using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static Hexa_Hub.Models.MultiValues;
using System.ComponentModel;


public class AssetRequest
{
    [Required]
    [Key]
    public int assetReqId { get; set; }

    [Required]
    public int userId { get; set; }

    [Required]
    public int assetId { get; set; }

    [Required]
    public int categoryId { get; set; }

    [Required]
    [DataType(DataType.Date)]
    [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
    public DateTime assetReqDate { get; set; }

    [Required]
    public string assetReqReason { get; set; }

    [DefaultValue(requestStatus.Pending)]
    public requestStatus? requestStatus { get; set; } = requestStatus.Pending;

    //Navigation Properties
    // 1 - 1 Relation

    public Asset? Asset {  get; set; }

    public User? User { get; set; }

    public AssetAllocation? AssetAlocation { get; set; }
}
