using System.ComponentModel.DataAnnotations;

namespace Hexa_Hub.DTO
{
    public class UserLoginDto
    {
        [Required]
        [Emailaddress]
        public string userMail { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
