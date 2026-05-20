using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using System.Text.Json.Serialization;
using static Hexa_Hub.Models.MultiValues;
using static Hexa_Hub.Models.MultiValues;


public class User
{
    [Required]
    [Key]
    public int userId { get; set; }

    [Required]
    [MaxLength(55)]
    public string userName { get; set; }

    [Required]
    [Emailaddress]
    public string userMail { get; set; }

    //[Required]
    public string? Gender { get; set; }

    //[Required]
    public string? dept { get; set; }

    //[Required]
    public string? designation { get; set; }

    [Required]
    [Phone(ErrorMessage = "Please enter a valid phone number")]
    public string phoneNumber { get; set; }

    //[Required]
    public string? address { get; set; }

    [Required]
    public string branch { get; set; }

    [Required]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters long")]
    [RegularExpression(@"^(?=.*[A-Za-z])(?=.*\d)(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
        ErrorMessage = "Password must contain Uppercase, alphanumeric and special characters")]
    public string Password { get; set; } = "Maventory@123";

    [DefaultValue(UserType.Executive)]
    public UserType? User_Type { get; set; } = UserType.Executive;

    public byte[]? ProfileImage { get; set; }

    //Navigation Properties

    // 1 - * Relation

    public ICollection<AssetRequest>? AssetRequests { get; set; } = new List<AssetRequest>();

    public ICollection<ServiceRequest>? ServiceRequests { get; set; } = new List<ServiceRequest>();

    public ICollection<AssetAllocation>? AssetAllocations { get; set; } = new List<AssetAllocation>();

    public ICollection<ReturnRequest>? ReturnRequests { get; set; } = new List<ReturnRequest>();

    public ICollection<Audit>? Audits { get; set; } = new List<Audit>();

    public ICollection<MaintenanceLog>? MaintenanceLogs { get; set; } = new List<MaintenanceLog>();

   
}
