using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static Hexa_Hub.Models.MultiValues;

public class SubCategory
{
    [Required]
    [Key]
    public int SubCategoryId { get; set; }

    [Required]
    [MaxLength(55)]
    public string? SubCategoryName { get; set; }

    [Required]
    public int CategoryId { get; set; }

    [Required]
    public int Quantity { get; set; }

    //Navigation Properties
    // 1 - 1 Relation

    public Category? Category { get; set; }

    // 1 - * Relation

    public ICollection<Asset>? Assets { get; set; } = new List<Asset>();


}
