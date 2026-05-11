using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using static Hexa_Hub.Models.MultiValues;
public class ServiceRequest
{
    [Required]
    [Key]
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

    [Required]
    public string serviceDescription { get; set; }

    [DefaultValue(Hexa_Hub.Models.MultiValues.serviceReqStatus.UnderReview)]
    public serviceReqStatus? serviceReqStatus { get; set; } = Hexa_Hub.Models.MultiValues.serviceReqStatus.UnderReview;

    //Navigation Properties
    // 1 - 1 Relation

    public Asset? Asset { get; set; }

    public User? User { get; set; } 
}
