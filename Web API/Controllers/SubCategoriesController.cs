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
        [HttpGet("by-Quantity")]
        public async Task<IActionResult> GetSubCategoriesByQuantity(int Quantity)
        {
            var subCategories = await _subcategory.GetSubCategoriesByQuantityAsync(Quantity);

            if (!subCategories.Any())
            {
                return NotFound("No subcategories found with the specified Quantity.");
            }

            return Ok(subCategories);
        }


        // Endpoint to get subcategories by category name
        [HttpGet("by-category-name")]
        public async Task<IActionResult> GetSubCategoriesBycategoryName(string categoryName)
        {
            var subCategories = await _subcategory.GetSubCategoriesBycategoryNameAsync(categoryName);

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
            if (id != subCategoriesDto.subCategoryId)
            {
                return BadRequest("Not Found");
            }

            var existingSubCategory = await _subcategory.GetSubCategoryById(id);
            if (existingSubCategory == null)
            {
                return NotFound("Id Not Found");
            }

            // Map DTO to model
            existingSubCategory.subCategoryName = subCategoriesDto.subCategoryName;
            existingSubCategory.categoryId = subCategoriesDto.categoryId;
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
                subCategoryName = subCategoriesDto.subCategoryName,
                categoryId = subCategoriesDto.categoryId,
                Quantity = subCategoriesDto.Quantity
            };

            _subcategory.AddSubCategory(subCategory);
            await _subcategory.Save();

            return CreatedAtAction("GetSubCategories", new { id = subCategory.subCategoryId }, subCategory);
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
            return _context.SubCategories.Any(e => e.subCategoryId == id);
        }
    }
}
