using Microsoft.Identity.Client;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Contracts;
using static Hexa_Hub.Models.MultiValues;

namespace Hexa_Hub.DTO
{
    public class ServiceClassDto
    {

        public int ServiceId { get; set; }
        public int AssetId { get; set; }
        public string AssetName { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
          
        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime ServiceRequestDate { get; set; }
        public string IssueTypeName => Issue_Type.ToString();
        public IssueType Issue_Type { get; set; }
        public string ServiceDescription { get; set; }
        public string ServiceReqStatusName => serviceReqStatus.ToString();
        public ServiceReqStatus serviceReqStatus { get; set; }
           
    }
}
