using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


public class MaintenanceLog
{
    [Required]
    [Key]
    public int maintenanceId { get; set; }

    [Required]
    public int assetId { get; set; }

    [Required]
    public int userId { get; set; }

    [Required]
    [DataType(DataType.Date)]
    [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
    public DateTime maintenanceDate { get; set; }

    public decimal? Cost { get; set; }

    public string? maintenanceDescription { get; set; }

    //Navigation Properties
    // * - 1 Relation

    public Asset? Asset { get; set; }

    public User? User { get; set; } 
}
