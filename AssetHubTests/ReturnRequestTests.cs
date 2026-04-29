using Moq;
using Hexa_Hub.Interface;
using static Hexa_Hub.Models.MultiValues;
using Hexa_Hub.DTO;

namespace AssetHubTests
{
    public class ReturnRequestTests
    {
        private IReturnReqRepo returnrepo;
        private Mock<IReturnReqRepo> returnrepoMock;

        [SetUp]

        public void SetUp()
        {
            returnrepoMock = new Mock<IReturnReqRepo>();
            returnrepo = returnrepoMock.Object;
        }

        [TestCase]
        public async Task ReturnsAllReturnRequestsAsync()
        {
            // Arrange
            var expectedReturnRequests = new List<ReturnClassDto>
            {
                new ReturnClassDto { ReturnId = 1, ReturnStatus = ReturnReqStatus.Approved },
                new ReturnClassDto { ReturnId = 2, ReturnStatus = ReturnReqStatus.Returned }
            };

            // Mock the repository methods
            returnrepoMock.Setup(a => a.GetAllReturnRequest())
                    .ReturnsAsync(expectedReturnRequests);

            // Act
            var result = await returnrepo.GetAllReturnRequest();

            // Assert
            Assert.IsNotNull(result, "Result should not be null");
            Assert.AreEqual(ReturnReqStatus.Approved, result[0].ReturnStatus);
            Assert.AreEqual(ReturnReqStatus.Returned, result[1].ReturnStatus);
        }

        [TestCase]
        public async Task AddReturnRequest_ShouldAddReturnRequest()
        {

            var newReturnRequestDto = new ReturnRequestDto
            {
                ReturnId = 3,
                UserId = 1,
                AssetId = 2,
                CategoryId = 3,
                ReturnDate = DateTime.Now,
                Reason = "Reason Test",
                Condition = "Good"
            };

            var expectedReturnRequest = new ReturnRequest
            {
                ReturnId = newReturnRequestDto.ReturnId,
                UserId = newReturnRequestDto.UserId,
                AssetId = newReturnRequestDto.AssetId,
                CategoryId = newReturnRequestDto.CategoryId,
                ReturnDate = newReturnRequestDto.ReturnDate,
                Reason = newReturnRequestDto.Reason,
                Condition = newReturnRequestDto.Condition
            };

            returnrepoMock.Setup(repo => repo.AddReturnRequest(It.IsAny<ReturnRequestDto>()))
                .ReturnsAsync(expectedReturnRequest);

            // Act
            var result = await returnrepo.AddReturnRequest(newReturnRequestDto);

            // Assert
            Assert.IsNotNull(result, "Result should not be null");
            Assert.AreEqual(newReturnRequestDto.ReturnId, result.ReturnId, "ReturnId should match");
            Assert.AreEqual(newReturnRequestDto.Reason, result.Reason, "Reason should match");

         
        }

        [TestCase]

        public async Task Save_ShouldCallSaveChanges()
        {
            // Act
            await returnrepo.Save();

            // Assert
            returnrepoMock.Verify(repo => repo.Save(), Times.Once);
        }

        [TestCase]
        public async Task DeleteReturnRequest_ShouldRemoveReturnRequest()
        {
            // Arrange
            var returnIdToDelete = 1;

            // Mock
            returnrepoMock.Setup(repo => repo.DeleteReturnRequest(It.IsAny<int>())).Callback<int>(id => { });


            // Act
            await returnrepo.DeleteReturnRequest(returnIdToDelete);

            // Assert
            returnrepoMock.Verify(repo => repo.DeleteReturnRequest(It.Is<int>(id => id == returnIdToDelete)), Times.Once);
        }

        [TestCase]
        public void UpdateReturnRequest_ShouldUpdateReturnRequest()
        {
            // Arrange
            var updatedReturnRequest = new ReturnClassDto { ReturnId = 1, ReturnStatus = ReturnReqStatus.Rejected };

            // Mock
            returnrepoMock.Setup(repo => repo.UpdateReturnRequest(It.IsAny<ReturnClassDto>()));

            // Act
            returnrepoMock.Object.UpdateReturnRequest(updatedReturnRequest);

            // Assert
            returnrepoMock.Verify(repo => repo.UpdateReturnRequest(It.Is<ReturnClassDto>(a =>
                a.ReturnId == updatedReturnRequest.ReturnId && a.ReturnStatus == updatedReturnRequest.ReturnStatus)), Times.Once);
        }
    }
}
