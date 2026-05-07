using static Hexa_Hub.Models.MultiValues;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace Hexa_Hub.DTO
{
    public class UserDto
    {
        public int userId { get; set; }

        [Required]
        [MaxLength(55)]
        public string userName { get; set; }

        [Required]
        [Emailaddress]
        public string userMail { get; set; }


        public string Gender { get; set; }


        public string dept { get; set; }


        public string designation { get; set; }


        [Phone(ErrorMessage = "Please enter a valid phone number")]
        public string phoneNumber { get; set; }

 
        public string address { get; set; }

        //[Required]
        //[MinLength(8, ErrorMessage = "Password must be at least 8 characters long")]
        //[RegularExpression(@"^(?=.*[A-Za-z])(?=.*\d)(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
        //    ErrorMessage = "Password must contain Uppercase, alphanumeric and special characters")]
        //public string Password { get; set; }

        public string branch { get; set; }

        
        public string User_Type { get; set; } 

        public byte[]? ProfileImage { get; set; }
    }
}
