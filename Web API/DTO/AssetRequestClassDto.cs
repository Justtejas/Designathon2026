
using static Hexa_Hub.Models.MultiValues;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
public class AssetRequestClassDto
{
    public int AssetReqId { get; set; }
    public string userName { get; set; }
    public string AssetName { get; set; }
    public int userId { get; set; }
    public int AssetId { get; set; }
    public string categoryName { get; set; }

    [DataType(DataType.Date)]
    [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:yyyy-MM-dd}")]
    public DateTime AssetReqDate { get; set; }
    public string AssetReqReason { get; set; }
    public string RequestStatusName => RequestStatus.ToString();
    public RequestStatus? RequestStatus { get; set; }
}
