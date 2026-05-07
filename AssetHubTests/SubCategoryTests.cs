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
                new SubCategory { subCategoryId = 1, subCategoryName = "Laptop", categoryId = 1 },
                new SubCategory { subCategoryId = 2, subCategoryName = "Headphones", categoryId = 1 }
                };

            // Mock the repository methods
            _subCategoryMock.Setup(c => c.GetAllSubCategories(categoryId))
                .ReturnsAsync(expectedSubCategories);

            // Act
            var result = await _subCategory.GetAllSubCategories(categoryId);

            // Assert
            Assert.IsNotNull(result, "Result should not be null");
            Assert.AreEqual(2, result.Count, "SubCategory count should be 2");
            Assert.AreEqual("Laptop", result[0].subCategoryName);
            Assert.AreEqual("Headphones", result[1].subCategoryName);
        }

        [TestCase]
        public async Task AddSubCategory_ShouldAddSubCategory()
        {
            // Arrange
            var newSubCategory = new SubCategory { subCategoryId = 3, subCategoryName = "Keyboard" };


            // Mock
            _subCategoryMock.Setup(repo => repo.AddSubCategory(It.IsAny<SubCategory>())).Callback((SubCategory subcategory) => { });

            // Act
            await _subCategory.AddSubCategory(newSubCategory);

            //Assert
            _subCategoryMock.Verify(repo => repo.AddSubCategory(It.Is<SubCategory>(s => s.subCategoryId == newSubCategory.subCategoryId && s.subCategoryName == newSubCategory.subCategoryName)), Times.Once);
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
            var subCategoryIdToDelete = 1;

            // Mock
            _subCategoryMock.Setup(repo => repo.DeleteSubCategory(It.IsAny<int>())).Callback<int>(id => { });


            // Act
            await _subCategory.DeleteSubCategory(subCategoryIdToDelete);

            // Assert
            _subCategoryMock.Verify(repo => repo.DeleteSubCategory(It.Is<int>(id => id == subCategoryIdToDelete)), Times.Once);
        }

        [TestCase]
        public async Task UpdateSubCategory_ShouldUpdateSubCategory()
        {
            // Arrange
            var updatedSubCategory = new SubCategory { subCategoryId = 1, subCategoryName = "Mouse" };

            // Mock
            _subCategoryMock.Setup(repo => repo.UpdateSubCategory(It.IsAny<SubCategory>())).ReturnsAsync((SubCategory cat) => cat);

            // Act
            var result = await _subCategory.UpdateSubCategory(updatedSubCategory);

            // Assert
            Assert.IsNotNull(result, "Result should not be null");
            Assert.AreEqual(updatedSubCategory.subCategoryId, result.subCategoryId, "Sub Category ID should match");
            Assert.AreEqual(updatedSubCategory.subCategoryId, result.subCategoryId, "Sub Category name should be updated");

            _subCategoryMock.Verify(repo => repo.UpdateSubCategory(It.Is<SubCategory>(s =>
                s.subCategoryId == updatedSubCategory.subCategoryId && s.subCategoryName == updatedSubCategory.subCategoryName)), Times.Once);
        }
    }
}
