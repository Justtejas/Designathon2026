using Moq;
using static Hexa_Hub.Models.MultiValues;
using Hexa_Hub.Interface;
using Microsoft.Build.Framework;
using Hexa_Hub.DTO;

namespace AssetHubTests
{
    public class ServiceRequestTests
    {
        private IServiceRequest _serviceRequest;
        private Mock<IServiceRequest> _serviceRequestMock;

        [SetUp]

        public void SetUp()
        {
            _serviceRequestMock = new Mock<IServiceRequest>();
            _serviceRequest = _serviceRequestMock.Object;
        }

        [TestCase]
        public async Task ReturnsAllServiceRequestsAsync()
        {

            // Arrange
            var expectedServiceRequest = new List<ServiceClassDto>
                {
                new ServiceClassDto { serviceId=1, serviceReqStatus = serviceReqStatus.Approved},

                new ServiceClassDto { serviceId=2, serviceReqStatus = serviceReqStatus.UnderReview}
                };

            // Mock the repository methods
            _serviceRequestMock.Setup(a => a.GetAllServiceRequests())
                .ReturnsAsync(expectedServiceRequest);

            // Act
            var result = await _serviceRequest.GetAllServiceRequests();

            // Assert
            Assert.IsNotNull(result, "Result should not be null");

            Assert.AreEqual(serviceReqStatus.Approved, result[0].serviceReqStatus);
            Assert.AreEqual(serviceReqStatus.UnderReview, result[1].serviceReqStatus);
        }

        [TestCase]
        public async Task AddServiceRequest_ShouldAddServiceRequest()
        {
            // Arrange
            var newServiceRequest = new ServiceRequest { serviceId = 3, serviceReqStatus = serviceReqStatus.Completed };


            // Mock
            _serviceRequestMock.Setup(repo => repo.AddServiceRequest(It.IsAny<ServiceRequest>())).Callback((ServiceRequest assetreq) => { });

            // Act
            await _serviceRequest.AddServiceRequest(newServiceRequest);

            //Assert
            _serviceRequestMock.Verify(repo => repo.AddServiceRequest(It.Is<ServiceRequest>(a => a.serviceId == newServiceRequest.serviceId && a.serviceReqStatus == newServiceRequest.serviceReqStatus)), Times.Once);
        }

        [TestCase]

        public async Task Save_ShouldCallSaveChanges()
        {
            // Act
            await _serviceRequest.Save();

            // Assert
            _serviceRequestMock.Verify(repo => repo.Save(), Times.Once);
        }

        [TestCase]
        public async Task DeleteServiceRequest_ShouldRemoveServiceRequest()
        {
            // Arrange
            var serviceIdToDelete = 1;

            // Mock
            _serviceRequestMock.Setup(repo => repo.DeleteServiceRequest(It.IsAny<int>())).Callback<int>(id => { });


            // Act
            await _serviceRequest.DeleteServiceRequest(serviceIdToDelete);

            // Assert
            _serviceRequestMock.Verify(repo => repo.DeleteServiceRequest(It.Is<int>(id => id == serviceIdToDelete)), Times.Once);
        }

        [TestCase]
        public async Task UpdateServiceRequest_ShouldUpdateServiceRequest()
        {
            // Arrange
            var updatedServiceRequest = new ServiceRequest { serviceId = 1, serviceReqStatus = serviceReqStatus.UnderReview };

            // Mock
            _serviceRequestMock.Setup(repo => repo.UpdateServiceRequest(It.IsAny<ServiceRequest>())).ReturnsAsync((ServiceRequest set) => set);

            // Act
            var result = await _serviceRequest.UpdateServiceRequest(updatedServiceRequest);

            // Assert
            Assert.IsNotNull(result, "Result should not be null");
            Assert.AreEqual(updatedServiceRequest.serviceId, result.serviceId, "Service ID should match");
            Assert.AreEqual(updatedServiceRequest.serviceReqStatus, result.serviceReqStatus, "Request Status should be updated");

            _serviceRequestMock.Verify(repo => repo.UpdateServiceRequest(It.Is<ServiceRequest>(a =>
                a.serviceId == updatedServiceRequest.serviceId && a.serviceReqStatus == updatedServiceRequest.serviceReqStatus)), Times.Once);
        }
    }
}
