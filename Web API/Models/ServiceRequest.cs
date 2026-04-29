using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using static Hexa_Hub.Models.MultiValues;
public class ServiceRequest
{
    [Required]
    [Key]
    public int ServiceId { get; set; }

    [Required]
    public int AssetId { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    [DataType(DataType.Date)]
    [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
    public DateTime ServiceRequestDate { get; set; }

    [Required]
    public IssueType Issue_Type { get; set; }

    [Required]
    public string ServiceDescription { get; set; }

    [DefaultValue(Hexa_Hub.Models.MultiValues.ServiceReqStatus.UnderReview)]
    public ServiceReqStatus? ServiceReqStatus { get; set; } = Hexa_Hub.Models.MultiValues.ServiceReqStatus.UnderReview;

    //Navigation Properties
    // 1 - 1 Relation

    public Asset? Asset { get; set; }

    public User? User { get; set; } 
}
