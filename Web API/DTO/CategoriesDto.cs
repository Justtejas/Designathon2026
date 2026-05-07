using System.ComponentModel.DataAnnotations;

namespace Hexa_Hub.DTO
{
    public class CategoriesDto
    {
        [Required]
        [Key]
        public int categoryId { get; set; }

        [Required]
        [MaxLength(55)]
        public string categoryName { get; set; }
    }
}
