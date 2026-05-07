using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using static Hexa_Hub.Models.MultiValues;

namespace Hexa_Hub.DTO
{
    public class UserRegisterDto
    {
        [Required]
        [MaxLength(55)]
        public string userName { get; set; }

        [Required]
        [Emailaddress]
        public string userMail { get; set; }

        //[Required]
        //public string Gender { get; set; }

        //[Required]
        //public string dept { get; set; }

        //[Required]
        //public string designation { get; set; }

        [Required]
        [Phone(ErrorMessage = "Please enter a valid phone number")]
        public string phoneNumber { get; set; }

        //[Required]
        //public string address { get; set; }

        //[Required]
        //[MinLength(8, ErrorMessage = "Password must be at least 8 characters long")]
        //[RegularExpression(@"^(?=.*[A-Za-z])(?=.*\d)(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
        //    ErrorMessage = "Password must contain Uppercase, alphanumeric and special characters")]
        public string Password { get; set; }

        [Required]
        public string branch { get; set; }

    }
}
