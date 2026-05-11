using static Hexa_Hub.Models.MultiValues;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace Hexa_Hub.DTO
{
    public class ReturnRequestDto
    {
        [Required]
        [Key]
        public int returnId { get; set; }

        [Required]
        public int userId { get; set; }

        [Required]
        public int assetId { get; set; }

        [Required]
        public int categoryId { get; set; }

        [Required]
        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime returnDate { get; set; }

        [Required]
        public string Reason { get; set; }

        [Required]
        public string Condition { get; set; }

     
        public string returnStatus { get; set; } 
    }
}
