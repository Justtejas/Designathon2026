using Moq;
using Hexa_Hub.Interface;
using Hexa_Hub.Repository;
using Microsoft.EntityFrameworkCore;
using Hexa_Hub.DTO;

namespace AssetHubTests
{
    public class CategoryTests
    {

        private ICategory _category;
        private Mock<ICategory> _categoryMock;

        [SetUp]
        public void SetUp()
        {
            _categoryMock = new Mock<ICategory>();
            _category = _categoryMock.Object;
        }



        [TestCase]
        public async Task ReturnsAllCategoriesAsync()
        {

            // Arrange
            var expectedCategories = new List<Category>
                {
                new Category { CategoryId = 1, CategoryName = "Software" },
                new Category { CategoryId = 2, CategoryName = "Hardware" }
                };

            // Mock the repository methods
            _categoryMock.Setup(c => c.GetAllCategories())
                .ReturnsAsync(expectedCategories);

            // Act
            var result = await _category.GetAllCategories();

            // Assert
            Assert.IsNotNull(result, "Result should not be null");
            Assert.AreEqual(2, result.Count, "Category count should be 2");
            Assert.AreEqual("Software", result[0].CategoryName);
            Assert.AreEqual("Hardware", result[1].CategoryName);
        }

        [TestCase]
        public async Task AddCategory_ShouldAddCategory()
        {
            // Arrange
            var newCategory = new CategoriesDto { CategoryId = 3, CategoryName = "Networking" };

            var newCat = new Category { CategoryId = newCategory.CategoryId, CategoryName = newCategory.CategoryName };


            // Mock
            _categoryMock.Setup(repo => repo.AddCategory(It.IsAny<CategoriesDto>())).ReturnsAsync(newCat);

            // Act
            var result  = await _category.AddCategory(newCategory);
            Assert.IsNotNull(result, "Result should not be null");
            Assert.AreEqual(newCategory.CategoryId, result.CategoryId, "CategoryId should match");

            //Assert
            _categoryMock.Verify(repo => repo.AddCategory(It.Is<CategoriesDto>(a =>
               a.CategoryId == newCategory.CategoryId && a.CategoryId == newCat.CategoryId && a.CategoryName == newCat.CategoryName)), Times.Once);

        }

        [TestCase]

        public async Task Save_ShouldCallSaveChanges()
        {
            // Act
            await _category.Save();

            // Assert
            _categoryMock.Verify(repo => repo.Save(), Times.Once);
        }

        [TestCase]
        public async Task DeleteCategory_ShouldRemoveCategory()
        {
            // Arrange
            var categoryIdToDelete = 1;

            // Mock
            _categoryMock.Setup(repo => repo.DeleteCategory(It.IsAny<int>())).Callback<int>(id => { });


            // Act
            await _category.DeleteCategory(categoryIdToDelete);

            // Assert
            _categoryMock.Verify(repo => repo.DeleteCategory(It.Is<int>(id => id == categoryIdToDelete)), Times.Once);
        }

    }
}












