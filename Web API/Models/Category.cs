using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static Hexa_Hub.Models.MultiValues;

public class Category
{
    [Required]
    [Key]
    public int CategoryId { get; set; }

    [Required]
    [MaxLength(55)]
    public string CategoryName { get; set; }

    //Navigation Properties
    // 1 - * Relation

    public ICollection<Asset>? Assets { get; set; } = new List<Asset>();

    public ICollection<SubCategory>? SubCategories { get; set; } = new List<SubCategory>();
}
