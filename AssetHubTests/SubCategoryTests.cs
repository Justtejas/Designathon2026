using Moq;
using Hexa_Hub.Interface;

namespace AssetHubTests
{
    public class SubCategoryTests
    {
        private ISubCategory _subCategory;
        private Mock<ISubCategory> _subCategoryMock;

        [SetUp]
        public void SetUp()
        {
            _subCategoryMock = new Mock<ISubCategory>();
            _subCategory = _subCategoryMock.Object;
        }

        [TestCase]
        public async Task ReturnsAllSubCategoriesAsync()
        {

            int categoryId = 1;
            // Arrange
            var expectedSubCategories = new List<SubCategory>
                {
                new SubCategory { SubCategoryId = 1, SubCategoryName = "Laptop", CategoryId = 1 },
                new SubCategory { SubCategoryId = 2, SubCategoryName = "Headphones", CategoryId = 1 }
                };

            // Mock the repository methods
            _subCategoryMock.Setup(c => c.GetAllSubCategories(categoryId))
                .ReturnsAsync(expectedSubCategories);

            // Act
            var result = await _subCategory.GetAllSubCategories(categoryId);

            // Assert
            Assert.IsNotNull(result, "Result should not be null");
            Assert.AreEqual(2, result.Count, "SubCategory count should be 2");
            Assert.AreEqual("Laptop", result[0].SubCategoryName);
            Assert.AreEqual("Headphones", result[1].SubCategoryName);
        }

        [TestCase]
        public async Task AddSubCategory_ShouldAddSubCategory()
        {
            // Arrange
            var newSubCategory = new SubCategory { SubCategoryId = 3, SubCategoryName = "Keyboard" };


            // Mock
            _subCategoryMock.Setup(repo => repo.AddSubCategory(It.IsAny<SubCategory>())).Callback((SubCategory subcategory) => { });

            // Act
            await _subCategory.AddSubCategory(newSubCategory);

            //Assert
            _subCategoryMock.Verify(repo => repo.AddSubCategory(It.Is<SubCategory>(s => s.SubCategoryId == newSubCategory.SubCategoryId && s.SubCategoryName == newSubCategory.SubCategoryName)), Times.Once);
        }

        [TestCase]

        public async Task Save_ShouldCallSaveChanges()
        {
            // Act
            await _subCategory.Save();

            // Assert
            _subCategoryMock.Verify(repo => repo.Save(), Times.Once);
        }

        [TestCase]
        public async Task DeleteSubCategory_ShouldRemoveCategory()
        {
            // Arrange
            var subcategoryIdToDelete = 1;

            // Mock
            _subCategoryMock.Setup(repo => repo.DeleteSubCategory(It.IsAny<int>())).Callback<int>(id => { });


            // Act
            await _subCategory.DeleteSubCategory(subcategoryIdToDelete);

            // Assert
            _subCategoryMock.Verify(repo => repo.DeleteSubCategory(It.Is<int>(id => id == subcategoryIdToDelete)), Times.Once);
        }

        [TestCase]
        public async Task UpdateSubCategory_ShouldUpdateSubCategory()
        {
            // Arrange
            var updatedSubCategory = new SubCategory { SubCategoryId = 1, SubCategoryName = "Mouse" };

            // Mock
            _subCategoryMock.Setup(repo => repo.UpdateSubCategory(It.IsAny<SubCategory>())).ReturnsAsync((SubCategory cat) => cat);

            // Act
            var result = await _subCategory.UpdateSubCategory(updatedSubCategory);

            // Assert
            Assert.IsNotNull(result, "Result should not be null");
            Assert.AreEqual(updatedSubCategory.SubCategoryId, result.SubCategoryId, "Sub Category ID should match");
            Assert.AreEqual(updatedSubCategory.SubCategoryId, result.SubCategoryId, "Sub Category name should be updated");

            _subCategoryMock.Verify(repo => repo.UpdateSubCategory(It.Is<SubCategory>(s =>
                s.SubCategoryId == updatedSubCategory.SubCategoryId && s.SubCategoryName == updatedSubCategory.SubCategoryName)), Times.Once);
        }
    }
}
