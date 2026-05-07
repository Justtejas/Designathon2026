using System.ComponentModel.DataAnnotations;
using static Hexa_Hub.Models.MultiValues;
using System.ComponentModel;


namespace Hexa_Hub.DTO
{
    public class ReturnClassDto
    { 
        public int ReturnId { get; set; }
        public int userId { get; set; }
        public string userName { get; set; }
        public string AssetName { get; set; }
        public int AssetId { get; set; }
        public int categoryId { get; set; }
        public string categoryName { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime ReturnDate { get; set; }

        public string Reason { get; set; }
        public string Condition { get; set; }

        public string ReturnStatusName => ReturnStatus.ToString();
        public ReturnReqStatus ReturnStatus { get; set; }
    }
}