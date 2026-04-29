using Hexa_Hub.Interface;
using Microsoft.EntityFrameworkCore;
using Hexa_Hub.Exceptions;

namespace Hexa_Hub.Repository
{
    public class SubCategoryService : ISubCategory
    {
        private readonly DataContext _context;

        public SubCategoryService(DataContext context)
        {
            _context = context;
        }

        public async Task<List<SubCategory>> GetAllSubCategories(int categoryId)
        {
            //return await _context.SubCategories.ToListAsync();
            return await _context.SubCategories
            .Where(sc => sc.CategoryId == categoryId)
            .ToListAsync();
        }

        public async Task<SubCategory> GetSubCategoryById(int id)
        {
            return await _context.SubCategories.FirstOrDefaultAsync();
        }

        public async Task AddSubCategory(SubCategory subCategory)
        {
            _context.SubCategories.Add(subCategory);

        }

        public Task<SubCategory> UpdateSubCategory(SubCategory subCategory)
        {
            _context.SubCategories.Update(subCategory);
            return Task.FromResult(subCategory);
        }

        public async Task DeleteSubCategory(int subCategoryId)
        {
            var subCategory = await _context.SubCategories.FindAsync(subCategoryId);
            if (subCategory == null)
            {

                throw new SubCategoryNotFoundException($"SubCategory with ID {subCategoryId} Not Found");
            }
            _context.SubCategories.Remove(subCategory);
        }

        public async Task<IEnumerable<SubCategory>> GetSubCategoriesByQuantityAsync(int quantity)
        {
            // Filter SubCategories by Quantity
            var subCategories = await _context.SubCategories
                .Where(sc => sc.Quantity >= quantity)
                .Include(sc => sc.Category) // Include Category for navigation
                .ToListAsync();

            return subCategories;
        }

        public async Task<IEnumerable<SubCategory>> GetSubCategoriesByCategoryNameAsync(string categoryName)
        {
            // Retrieve subcategories for the specified category name
            var subCategories = await _context.SubCategories
                .Where(sc => sc.Category.CategoryName == categoryName)
                .ToListAsync();

            return subCategories;
        }

        public async Task Save()
        {
            await _context.SaveChangesAsync();
        }
    }
}
