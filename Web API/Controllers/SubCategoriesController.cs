using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Hexa_Hub.DTO;
using Hexa_Hub.Exceptions;
using Hexa_Hub.Interface;
using Hexa_Hub.Repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Hexa_Hub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubCategoriesController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly ISubCategory _subcategory;

        public SubCategoriesController(DataContext context, ISubCategory subCategory)
        {
            _context = context;
            _subcategory = subCategory;
        }

        // GET: api/SubCategories
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<SubCategory>>> GetSubCategories(int categoryId)
        {
            //return await _subcategory.GetAllSubCategories();
            var subCategories = await _subcategory.GetAllSubCategories(categoryId);
            return Ok(subCategories);
        }

        // Filter by Quantity
        [HttpGet("by-quantity")]
        public async Task<IActionResult> GetSubCategoriesByQuantity(int quantity)
        {
            var subCategories = await _subcategory.GetSubCategoriesByQuantityAsync(quantity);

            if (!subCategories.Any())
            {
                return NotFound("No subcategories found with the specified quantity.");
            }

            return Ok(subCategories);
        }


        // Endpoint to get subcategories by category name
        [HttpGet("by-category-name")]
        public async Task<IActionResult> GetSubCategoriesByCategoryName(string categoryName)
        {
            var subCategories = await _subcategory.GetSubCategoriesByCategoryNameAsync(categoryName);

            if (subCategories == null || !subCategories.Any())
            {
                return NotFound("No subcategories found for the specified category.");
            }

            return Ok(subCategories);
        }


        // PUT: api/SubCategories/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutSubCategory(int id, SubCategoriesDto subCategoriesDto)
        {
            if (id != subCategoriesDto.SubCategoryId)
            {
                return BadRequest("Not Found");
            }

            var existingSubCategory = await _subcategory.GetSubCategoryById(id);
            if (existingSubCategory == null)
            {
                return NotFound("Id Not Found");
            }

            // Map DTO to model
            existingSubCategory.SubCategoryName = subCategoriesDto.SubCategoryName;
            existingSubCategory.CategoryId = subCategoriesDto.CategoryId;
            existingSubCategory.Quantity = subCategoriesDto.Quantity;

            _subcategory.UpdateSubCategory(existingSubCategory);

            try
            {
                await _subcategory.Save();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SubCategoryExists(id))
                {
                    return NotFound("Id Not Found");
                }
                else
                {
                    throw;
                }
            }

            return Ok("Updation Success");
        }

        // POST: api/SubCategories
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<SubCategory>> PostSubCategory(SubCategoriesDto subCategoriesDto)
        {
            // Map DTO to model
            var subCategory = new SubCategory
            {
                SubCategoryName = subCategoriesDto.SubCategoryName,
                CategoryId = subCategoriesDto.CategoryId,
                Quantity = subCategoriesDto.Quantity
            };

            _subcategory.AddSubCategory(subCategory);
            await _subcategory.Save();

            return CreatedAtAction("GetSubCategories", new { id = subCategory.SubCategoryId }, subCategory);
        }

        // DELETE: api/SubCategories/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteSubCategory(int id)
        {

            try
            {
                await _subcategory.DeleteSubCategory(id);
                await _subcategory.Save();
                return NoContent();
            }
            catch (SubCategoryNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        private bool SubCategoryExists(int id)
        {
            return _context.SubCategories.Any(e => e.SubCategoryId == id);
        }
    }
}
