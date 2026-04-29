using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static Hexa_Hub.Models.MultiValues;
using System.ComponentModel;


public class AssetRequest
{
    [Required]
    [Key]
    public int AssetReqId { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public int AssetId { get; set; }

    [Required]
    public int CategoryId { get; set; }

    [Required]
    [DataType(DataType.Date)]
    [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
    public DateTime AssetReqDate { get; set; }

    [Required]
    public string AssetReqReason { get; set; }

    [DefaultValue(RequestStatus.Pending)]
    public RequestStatus? Request_Status { get; set; } = RequestStatus.Pending;

    //Navigation Properties
    // 1 - 1 Relation

    public Asset? Asset {  get; set; }

    public User? User { get; set; }

    public AssetAllocation? AssetAlocation { get; set; }
}
