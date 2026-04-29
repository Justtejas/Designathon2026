using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static Hexa_Hub.Models.MultiValues;

public class Audit
{
    [Required]
    [Key]
    public int AuditId { get; set; }

    [Required]
    public int AssetId { get; set; }

    [Required]
    public int UserId { get; set; }

    [DataType(DataType.Date)]
    [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
    public DateTime? AuditDate { get; set; }

    public string? AuditMessage { get; set; }

    [DefaultValue(AuditStatus.Sent)]
    public AuditStatus? Audit_Status { get; set; } = AuditStatus.Sent;

    //Navigation Properties
    // 1 - 1 Relation

    public Asset? Asset { get; set; }

    public User? User { get; set; }
}
