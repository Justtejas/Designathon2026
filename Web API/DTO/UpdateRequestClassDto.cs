using static Hexa_Hub.Models.MultiValues;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Hexa_Hub.DTO
{
    public class UpdateRequestClassDto
    {
        public int assetReqId { get; set; }
        public string userName { get; set; }
        public string assetName { get; set; }
        public int userId { get; set; }
        public int assetId { get; set; }
        public string categoryName { get; set; }
        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime assetReqDate { get; set; }
        public string assetReqReason { get; set; }
        public string requestStatusName => requestStatus.ToString();
        public requestStatus? requestStatus { get; set; }
    }

}

