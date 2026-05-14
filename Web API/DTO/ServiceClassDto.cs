using Microsoft.Identity.Client;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Contracts;
using static Hexa_Hub.Models.MultiValues;

namespace Hexa_Hub.DTO
{
    public class ServiceClassDto
    {

        public int serviceId { get; set; }
        public int assetId { get; set; }
        public string assetName { get; set; }
        public int userId { get; set; }
        public string userName { get; set; }
          
        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime serviceRequestDate { get; set; }
        public string issueType => issueType.ToString();
        public issueType issueType { get; set; }
        public string serviceDescription { get; set; }
        public string serviceReqStatus => serviceReqStatus.ToString();
        public serviceReqStatus serviceReqStatus { get; set; }
           
    }
}
