using System.ComponentModel.DataAnnotations;

namespace Hexa_Hub.DTO
{
    public class SubCategoriesDto
    {
        [Required]
        [Key]
        public int SubCategoryId { get; set; }

        [Required]
        [MaxLength(55)]
        public string SubCategoryName { get; set; }

        [Required]
        public int CategoryId { get; set; }

        [Required]
        public int Quantity { get; set; }
    }
}
