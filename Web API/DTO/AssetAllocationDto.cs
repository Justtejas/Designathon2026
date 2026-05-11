using System.ComponentModel.DataAnnotations;

namespace Hexa_Hub.DTO
{
    public class AssetAllocationDto
    {
        [Required]
        [Key]
        public int allocationId { get; set; }

        [Required]
        public int assetId { get; set; }

        [Required]
        public int userId { get; set; }

        [Required]
        public int assetReqId { get; set; }

        [Required]
        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime allocatedDate { get; set; } = DateTime.Now;

    }
}
