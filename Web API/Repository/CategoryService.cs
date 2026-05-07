using Hexa_Hub.Interface;
using Microsoft.EntityFrameworkCore;
using Hexa_Hub.Exceptions;
using Hexa_Hub.DTO;
namespace Hexa_Hub.Repository
{
    public class CategoryService : ICategory
    {
        private readonly DataContext _context;

        public CategoryService(DataContext context)
        {
            _context = context;
        }

        public async Task<List<Category>> GetAllCategories()
        {
            return await _context.Categories.ToListAsync();
        }
        //Include(c => c.Assets).Include(c => c.SubCategories).
        public async Task<Category?> GetCategoryById(int id)
        {
            return await _context.Categories
                                 .Include(c => c.Assets)
                                 .Include(c => c.SubCategories)
                                 .FirstOrDefaultAsync(c => c.categoryId == id);
        }
        public async Task<IEnumerable<string>> GetAllcategoryNamesAsync()
        {
            // Retrieve distinct category names for the dropdown
            var categoryNames = await _context.Categories
                .Select(c => c.categoryName)
                .Distinct()
                .ToListAsync();

            return categoryNames;
        }

        public async Task<Category> AddCategory(CategoriesDto categoryDto)
        {
            var category = new Category
            {
                categoryId = categoryDto.categoryId,
                categoryName = categoryDto.categoryName
            };
            await _context.AddAsync(category);
            return category;
        }

        public async Task<bool> UpdateCategoryAsync(int id, CategoriesDto categoryDto)
        {
            var existingCategory = await _context.Categories.FindAsync(id);
            if (existingCategory == null)
            {
                return false;
            }

            existingCategory.categoryName = categoryDto.categoryName;

            _context.Categories.Update(existingCategory);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                throw new CategoryNotFoundException($"Category with ID {id} Not Found");
            }

            _context.Categories.Remove(category);

        }
        public async Task Save()
        {
            await _context.SaveChangesAsync();
        }

    }
}

