using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using static Hexa_Hub.Models.MultiValues;

namespace Hexa_Hub.DTO
{
    public class AssetUpdateDto
    {

        [Required]
        [Key]
        public int assetId { get; set; }

        [Required]
        [MaxLength(55)]
        public string assetName { get; set; }

        public string? assetDescription { get; set; }

        [Required]
        public int categoryId { get; set; }

        [Required]
        public int subCategoryId { get; set; }

        public IFormFile? assetImage { get; set; }

        [Required]
        public string serialNumber { get; set; }

        [Required]
        public string Model { get; set; }

        [Required]
        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime manufacturingDate { get; set; }

        [Required]
        [MaxLength(55)]
        public string Location { get; set; }

        [Required]
        public decimal Value { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime? expiryDate { get; set; }

        public string? assetStatus { get; set; }
    }
}
