using static Hexa_Hub.Models.MultiValues;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace Hexa_Hub.DTO
{
    public class AuditsDto
    {
        public int AuditId { get; set; }

        public int AssetId { get; set; }

        public int UserId { get; set; }

        [DataType(DataType.Date)]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
        public DateTime? AuditDate { get; set; }

        public string? AuditMessage { get; set; }
       
        public string Audit_Status { get; set; }

        public string? AssetName { get; set; }

        public string? UserName { get; set; }
    }
}
