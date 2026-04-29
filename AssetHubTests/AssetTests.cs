using Hexa_Hub.DTO;
using Hexa_Hub.Interface;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssetHubTests
{
    public class AssetTests
    {
        private IAsset asset;
        private Mock<IAsset> assetMock;


        [SetUp]
        public void SetUp()
        {
            assetMock = new Mock<IAsset>();
            asset = assetMock.Object;
        }

        [TestCase]
        public async Task ReturnsAllAssetsAsync()
        {

            // Arrange
            var expectedAssets = new List<Asset>
                {
                new Asset { AssetId = 1, AssetName ="Dell Laptop", SubCategoryId = 1,SerialNumber="7GHY5265",Model="G14",Location="Chennai"},
                new Asset { AssetId = 2, AssetName = "Headphone" ,SubCategoryId=2,SerialNumber="DT6788",Model="5G67",Location = "Mumbai"}
                };

            // Mock the repository methods
            assetMock.Setup(a => a.GetAllAssets())
                .ReturnsAsync(expectedAssets);

            // Act
            var result = await asset.GetAllAssets();

            // Assert
            Assert.IsNotNull(result, "Result should not be null");
            Assert.AreEqual(2, result.Count, "Asset count should be 2");
            Assert.AreEqual("Dell Laptop", result[0].AssetName);
            Assert.AreEqual("Headphone", result[1].AssetName);
        }

        [TestCase]
        public async Task AddAsset_ShouldAddAsset()
        {
            // Arrange
            var newAssetDto = new AssetDto {  AssetName = "DriverDisk" };

            var newAsset = new Asset { AssetName = newAssetDto.AssetName };
            // Mock
            assetMock.Setup(repo => repo.AddAsset(It.IsAny<AssetDto>())).ReturnsAsync(newAsset);

            // Act
            var reuslt = await asset.AddAsset(newAssetDto);

            Assert.IsNotNull(reuslt, "Result should not be null");
            Assert.AreEqual(newAssetDto.AssetName, reuslt.AssetName, "Asset Name Should Match");

            //Assert
            assetMock.Verify(repo => repo.AddAsset(It.Is<AssetDto>(c => c.AssetName == newAsset.AssetName)), Times.Once);
        }

        [TestCase]

        public async Task Save_ShouldCallSaveChanges()
        {
            // Act
            await asset.Save();

            // Assert
            assetMock.Verify(repo => repo.Save(), Times.Once);
        }

        [TestCase]
        public async Task DeleteAsset_ShouldRemoveAsset()
        {
            // Arrange
            var assetIdToDelete = 1;

            // Mock
            assetMock.Setup(repo => repo.DeleteAsset(It.IsAny<int>())).Callback<int>(id => { });


            // Act
            await asset.DeleteAsset(assetIdToDelete);

            // Assert
            assetMock.Verify(repo => repo.DeleteAsset(It.Is<int>(id => id == assetIdToDelete)), Times.Once);
        }

        [TestCase]
        public async Task UpdateAsset_ShouldUpdateAsset()
        {
            // Arrange
            var updatedAsset = new Asset { AssetId = 1, AssetName = "Lenovo Laptop" };

            // Mock
            assetMock.Setup(repo => repo.UpdateAsset(It.IsAny<Asset>())).ReturnsAsync((Asset set) => set);

            // Act
            var result = await asset.UpdateAsset(updatedAsset);

            // Assert
            Assert.IsNotNull(result, "Result should not be null");
            Assert.AreEqual(updatedAsset.AssetId, result.AssetId, "Asset ID should match");
            Assert.AreEqual(updatedAsset.AssetName, result.AssetName, "Asset name should be updated");

            assetMock.Verify(repo => repo.UpdateAsset(It.Is<Asset>(a =>
                a.AssetId == updatedAsset.AssetId && a.AssetName == updatedAsset.AssetName)), Times.Once);
        }







    }
}
