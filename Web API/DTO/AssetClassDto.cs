using static Hexa_Hub.Models.MultiValues;
using System.ComponentModel.DataAnnotations;

namespace Hexa_Hub.DTO
{
    public class AssetDtoClass
    {
        public int assetId { get; set; }
        public string assetName { get; set; }
        public string assetDescription { get; set; }
        public string Location { get; set; }
        public decimal Value { get; set; }
        public string categoryName { get; set; }

        public int categoryId { get; set; }

        public int subCategoryId { get; set; }
        public string subCategoryName { get; set; }
        public string serialNumber { get; set; }
        public string Model { get; set; }
        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime manufacturingDate { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime? expiryDate { get; set; }

        // Add this computed property to return the assetStatus as a string
        public string assetStatus => assetStatus.ToString();  // This converts the enum to a string

        // The existing property (you can keep it if needed)
        public assetStatus? assetStatus { get; set; }
    }
}