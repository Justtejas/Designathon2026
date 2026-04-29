using System.ComponentModel.DataAnnotations;

namespace Hexa_Hub.DTO
{
    public class CategoriesDto
    {
        [Required]
        [Key]
        public int CategoryId { get; set; }

        [Required]
        [MaxLength(55)]
        public string CategoryName { get; set; }
    }
}
