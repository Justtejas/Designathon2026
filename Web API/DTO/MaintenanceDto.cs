using System.ComponentModel.DataAnnotations;

namespace Hexa_Hub.DTO
{
    public class MaintenanceDto
    {
        [Required]
        [Key]
        public int MaintenanceId { get; set; }

        [Required]
        public int AssetId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime Maintenance_date { get; set; }

        public decimal? Cost { get; set; }

        public string? Maintenance_Description { get; set; }
    }
}
