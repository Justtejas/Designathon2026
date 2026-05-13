using Moq;
using Hexa_Hub.Interface;
using static Hexa_Hub.Models.MultiValues;
using Hexa_Hub.DTO;

namespace AssetHubTests
{
    public class AssetRequestTests
    {
        private IAssetRequest assetRequest;
        private Mock<IAssetRequest> assetRequestMock;

        [SetUp]

        public void SetUp()
        {
            assetRequestMock = new Mock<IAssetRequest>();
            assetRequest = assetRequestMock.Object;
        }

        [TestCase]
        public async Task ReturnsAllAssetRequestsAsync()
        {

            // Arrange
            var expectedAssetRequest = new List<AssetRequestClassDto>
                {
                new AssetRequestClassDto { assetReqId=1,requestStatus=requestStatus.Pending},
                new AssetRequestClassDto { assetReqId = 2, requestStatus=requestStatus.Allocated}
                };

            // Mock the repository methods
            assetRequestMock.Setup(a => a.GetAllAssetRequests())
                .ReturnsAsync(expectedAssetRequest);

            // Act
            var result = await assetRequest.GetAllAssetRequests();

            // Assert
            Assert.IsNotNull(result, "Result should not be null");

            Assert.AreEqual(requestStatus.Pending, result[0].requestStatus);
            Assert.AreEqual(requestStatus.Allocated, result[1].requestStatus);
        }

        [TestCase]
        public async Task AddAssetRequest_ShouldAddAssetRequest()
        {
            // Arrange
            var newAssetRequest = new AssetRequestDto { assetReqId = 3, assetId = 2 };


            // Mock
            assetRequestMock.Setup(repo => repo.AddAssetRequest(It.IsAny<AssetRequestDto>())).Callback((AssetRequestDto assetreq) => { });

            // Act
            await assetRequest.AddAssetRequest(newAssetRequest);

            //Assert
            assetRequestMock.Verify(repo => repo.AddAssetRequest(It.Is<AssetRequestDto>(a => a.assetReqId == newAssetRequest.assetReqId && a.requestStatus == newAssetRequest.requestStatus)), Times.Once);
        }

        [TestCase]

        public async Task Save_ShouldCallSaveChanges()
        {
            // Act
            await assetRequest.Save();

            // Assert
            assetRequestMock.Verify(repo => repo.Save(), Times.Once);
        }

        [TestCase]
        public async Task DeleteRequest_ShouldRemoveRequest()
        {
            // Arrange
            var ReqIdToDelete = 1;

            // Mock
            assetRequestMock.Setup(repo => repo.DeleteAssetRequest(It.IsAny<int>())).Callback<int>(id => { });


            // Act
            await assetRequest.DeleteAssetRequest(ReqIdToDelete);

            // Assert
            assetRequestMock.Verify(repo => repo.DeleteAssetRequest(It.Is<int>(id => id == ReqIdToDelete)), Times.Once);
        }

        [TestCase]
        public async Task UpdateRequest_ShouldUpdateRequest()
        {
            var updateRequestDto = new UpdateRequestClassDto
            {
                assetReqId = 1
            };

            var updatedRequest = new AssetRequest
            {
                assetReqId = 1,
                requestStatus = requestStatus.Allocated
            };
            assetRequestMock.Setup(repo => repo.UpdateAssetRequest(It.IsAny<int>(), It.IsAny<UpdateRequestClassDto>()))
                .ReturnsAsync(updatedRequest);
            var result = await assetRequest.UpdateAssetRequest(updateRequestDto.assetReqId, updateRequestDto);
            Assert.IsNotNull(result, "Result should not be null");
            Assert.AreEqual(updatedRequest.assetReqId, result.assetReqId, "AssetReq ID should match");
            Assert.AreEqual(updatedRequest.requestStatus, result.requestStatus, "Request Status should be updated");

            assetRequestMock.Verify(repo => repo.UpdateAssetRequest(It.Is<int>(id => id == updateRequestDto.assetReqId),
                It.Is<UpdateRequestClassDto>(a => a.requestStatus == updateRequestDto.requestStatus)), Times.Once);
        }
    }
}
