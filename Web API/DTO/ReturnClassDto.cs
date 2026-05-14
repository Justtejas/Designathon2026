using System.ComponentModel.DataAnnotations;
using static Hexa_Hub.Models.MultiValues;
using System.ComponentModel;


namespace Hexa_Hub.DTO
{
    public class ReturnClassDto
    { 
        public int returnId { get; set; }
        public int userId { get; set; }
        public string userName { get; set; }
        public string assetName { get; set; }
        public int assetId { get; set; }
        public int categoryId { get; set; }
        public string categoryName { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime returnDate { get; set; }

        public string Reason { get; set; }
        public string Condition { get; set; }

        public string returnStatus => returnStatus.ToString();
        public ReturnReqStatus returnStatus { get; set; }
    }
}