using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static Hexa_Hub.Models.MultiValues;

public class ReturnRequest
{
    [Required]
    [Key]
    public int ReturnId { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public int AssetId { get; set; }

    [Required]
    public int CategoryId { get; set; }

    [Required]
    [DataType(DataType.Date)]
    [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
    public DateTime ReturnDate { get; set; }

    [Required]
    public string Reason { get; set; }

    [Required]
    public string Condition { get; set; }

    [DefaultValue(ReturnReqStatus.Sent)]
    public ReturnReqStatus? ReturnStatus { get; set; } = ReturnReqStatus.Sent;

    //Navigation Properties
    // * - 1 Relation

    public Asset? Asset { get; set; }

    public User? User { get; set; } 
}
