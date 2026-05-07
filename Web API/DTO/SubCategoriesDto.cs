using System.ComponentModel.DataAnnotations;

namespace Hexa_Hub.DTO
{
    public class SubCategoriesDto
    {
        [Required]
        [Key]
        public int subCategoryId { get; set; }

        [Required]
        [MaxLength(55)]
        public string subCategoryName { get; set; }

        [Required]
        public int categoryId { get; set; }

        [Required]
        public int Quantity { get; set; }
    }
}
