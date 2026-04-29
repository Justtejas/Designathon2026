using static Hexa_Hub.Models.MultiValues;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Hexa_Hub.DTO
{
    public class UpdateRequestClassDto
    {
        public int AssetReqId { get; set; }
        public string UserName { get; set; }
        public string AssetName { get; set; }
        public int UserId { get; set; }
        public int AssetId { get; set; }
        public string CategoryName { get; set; }
        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime AssetReqDate { get; set; }
        public string AssetReqReason { get; set; }
        public string RequestStatusName => RequestStatus.ToString();
        public RequestStatus? RequestStatus { get; set; }
    }

}

