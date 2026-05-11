using Hexa_Hub.Models;
using static Hexa_Hub.Models.MultiValues;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace Hexa_Hub.DTO
{
    public class ServiceRequestDto
    {
        public int serviceId { get; set; }

        [Required]
        public int assetId { get; set; }

        [Required]
        public int userId { get; set; }

        [Required]
        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime serviceRequestDate { get; set; }

        [Required]
        public issueType issueType { get; set; }

 
        public string serviceDescription { get; set; }

        
        public string serviceReqStatus { get; set; }
    }
}
