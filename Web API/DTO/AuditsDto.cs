using static Hexa_Hub.Models.MultiValues;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace Hexa_Hub.DTO
{
    public class AuditsDto
    {
        public int auditId { get; set; }

        public int assetId { get; set; }

        public int userId { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime? auditDate { get; set; }

        public string? auditMessage { get; set; }
       
        public string auditStatus { get; set; }

        public string? assetName { get; set; }

        public string? userName { get; set; }
    }
}
