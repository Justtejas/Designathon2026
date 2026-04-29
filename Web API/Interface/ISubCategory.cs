namespace Hexa_Hub.Interface
{
    public interface ISubCategory
    {
        //Task<List<SubCategory>> GetAllSubCategories();
        Task<List<SubCategory>> GetAllSubCategories(int categoryId);
        Task<SubCategory> GetSubCategoryById(int id);
        Task AddSubCategory(SubCategory subcategory);
        Task<SubCategory> UpdateSubCategory(SubCategory subcategory);
        Task DeleteSubCategory(int id);
        Task<IEnumerable<SubCategory>> GetSubCategoriesByQuantityAsync(int quantity);
        Task<IEnumerable<SubCategory>> GetSubCategoriesByCategoryNameAsync(string categoryName);
        Task Save();
    }
}
