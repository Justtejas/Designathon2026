using System.ComponentModel.DataAnnotations;

namespace Hexa_Hub.DTO
{
    public class PasswordDto
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        [MinLength(8, ErrorMessage = "Current password must be at least 8 characters long")]
        public string CurrentPassword { get; set; }

        [Required]
        [MinLength(8, ErrorMessage = "New password must be at least 8 characters long")]
        [RegularExpression(@"^(?=.*[A-Za-z])(?=.*\d)(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
            ErrorMessage = "New password must contain Uppercase, alphanumeric and special characters")]
        public string NewPassword { get; set; }
       

    }
}
