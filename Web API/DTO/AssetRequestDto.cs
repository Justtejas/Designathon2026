using static Hexa_Hub.Models.MultiValues;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace Hexa_Hub.DTO
{
    public class AssetRequestDto
    {

        public int assetReqId { get; set; }

        [Required]
        public int userId { get; set; }

        [Required]
        public int assetId { get; set; }

        [Required]
        public int categoryId { get; set; }

        [Required]
        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime assetReqDate { get; set; }

        [Required]
        public string assetReqReason { get; set; }
        public string requestStatus { get; set; }
    }
}
