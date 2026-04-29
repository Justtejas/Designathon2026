using System.ComponentModel.DataAnnotations;
namespace Hexa_Hub.DTO
{
    public class MaintenanceClassDto
    {
        public int MaintenanceId { get; set; }
        public int AssetId { get; set; }
        public int UserId { get; set; }
        public string AssetName { get; set; }
        public string UserName { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime Maintenance_date { get; set; }
        public decimal? Cost { get; set; }
        public string? Maintenance_Description { get; set; }

    }
}
