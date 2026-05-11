using System.ComponentModel.DataAnnotations;

namespace Hexa_Hub.DTO
{
    public class AllocationDto
    {
        [Required]
        public int userId { get; set; }
        [Required]
        public int assetId { get; set; }
        [Required]
        public string assetName { get; set; }

        [Required]
        public int categoryId { get; set; }

        [Required]
        public string categoryName { get; set; }

        [Required]
        public decimal Value { get; set; }
        [Required]
        public string assetStatus { get; set; }
        [Required]
        public string Model { get; set; }


        [Required]
        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime allocatedDate { get; set; } = DateTime.Now;


    }
}