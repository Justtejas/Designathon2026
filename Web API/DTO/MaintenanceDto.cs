using System.ComponentModel.DataAnnotations;

namespace Hexa_Hub.DTO
{
    public class MaintenanceDto
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
    }
}
