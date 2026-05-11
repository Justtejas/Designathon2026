using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static Hexa_Hub.Models.MultiValues;

public class Audit
{
    [Required]
    [Key]
    public int auditId { get; set; }

    [Required]
    public int assetId { get; set; }

    [Required]
    public int userId { get; set; }

    [DataType(DataType.Date)]
    [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
    public DateTime? auditDate { get; set; }

    public string? auditMessage { get; set; }

    [DefaultValue(auditStatus.Sent)]
    public auditStatus? auditStatus { get; set; } = auditStatus.Sent;

    //Navigation Properties
    // 1 - 1 Relation

    public Asset? Asset { get; set; }

    public User? User { get; set; }
}
