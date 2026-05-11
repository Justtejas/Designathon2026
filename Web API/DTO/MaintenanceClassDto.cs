using System.ComponentModel.DataAnnotations;
namespace Hexa_Hub.DTO
{
    public class MaintenanceClassDto
    {
        public int maintenanceId { get; set; }
        public int assetId { get; set; }
        public int userId { get; set; }
        public string assetName { get; set; }
        public string userName { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime maintenanceDate { get; set; }
        public decimal? Cost { get; set; }
        public string? maintenanceDescription { get; set; }

    }
}
