using Hexa_Hub.DTO;
using Microsoft.EntityFrameworkCore;
namespace Hexa_Hub.Interface
{

    public interface ICategory
    {
        Task<List<Category>> GetAllCategories();
        Task<Category> AddCategory(CategoriesDto category);
        Task<Category?> GetCategoryById(int id);
        Task<IEnumerable<string>> GetAllCategoryNamesAsync();
        Task<bool> UpdateCategoryAsync(int id, CategoriesDto categoryDto);
        Task DeleteCategory(int id);
        Task Save();
    }

}

