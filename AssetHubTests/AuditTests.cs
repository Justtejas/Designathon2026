using Moq;
using Hexa_Hub.Interface;
using static Hexa_Hub.Models.MultiValues;
using Hexa_Hub.DTO;


namespace AssetHubTests
{
    public class AuditTests
    {
        private IAuditRepo audit;
        private Mock<IAuditRepo> auditMock;


        [SetUp]
        public void SetUp()
        {
            auditMock = new Mock<IAuditRepo>();
            audit = auditMock.Object;
        }

        [TestCase]
        public async Task ReturnsAllAuditsAsync()
        {

            // Arrange
            var expectedAudits = new List<AuditsDto>
                {
                new AuditsDto { auditId = 1},
                new AuditsDto { auditId = 2}
                };

            // Mock the repository methods
            auditMock.Setup(a => a.GetAllAudits())
                .ReturnsAsync(expectedAudits);

            // Act
            var result = await audit.GetAllAudits();

            // Assert
            Assert.IsNotNull(result, "Result should not be null");
            Assert.AreEqual(2, result.Count, "Audit count should be 2");
        }

        [TestCase]
        public async Task AddAudit_ShouldAddAudit()
        {
            var newAuditDto = new AuditsDto
            {
                auditId = 3,
                assetId = 1,
                userId = 2,
                auditDate = DateTime.Now,
                auditMessage = "Test audit"
            };

            var newAudit = new Audit
            {
                auditId = newAuditDto.auditId,
                assetId = newAuditDto.assetId,
                userId = newAuditDto.userId,
                auditDate = newAuditDto.auditDate,
                auditMessage = newAuditDto.auditMessage
            };

            auditMock.Setup(repo => repo.AddAduit(It.IsAny<AuditsDto>()))
                .ReturnsAsync(newAudit);

            var result = await audit.AddAduit(newAuditDto);

            Assert.IsNotNull(result, "Result should not be null");
            Assert.AreEqual(newAuditDto.auditId, result.auditId, "auditId should match");
            Assert.AreEqual(newAuditDto.assetId, result.assetId, "assetId should match");
            Assert.AreEqual(newAuditDto.userId, result.userId, "userId should match");

            auditMock.Verify(repo => repo.AddAduit(It.Is<AuditsDto>(a =>
                a.auditId == newAuditDto.auditId && a.assetId == newAuditDto.assetId && a.userId == newAuditDto.userId)), Times.Once);
        }


        [TestCase]

        public async Task Save_ShouldCallSaveChanges()
        {
            // Act
            await audit.Save();

            // Assert
            auditMock.Verify(repo => repo.Save(), Times.Once);
        }

        [TestCase]
        public async Task DeleteAudit_ShouldRemoveAudit()
        {
            // Arrange
            var auditIdToDelete = 1;

            // Mock
            auditMock.Setup(repo => repo.DeleteAuditReq(It.IsAny<int>())).Callback<int>(id => { });


            // Act
            await audit.DeleteAuditReq(auditIdToDelete);

            // Assert
            auditMock.Verify(repo => repo.DeleteAuditReq(It.Is<int>(id => id == auditIdToDelete)), Times.Once);
        }

        [TestCase]
        public async Task UpdateAudit_ShouldUpdateAudit()
        {
            // Arrange
            var updatedAudit = new Audit { auditId = 1, auditStatus = auditStatus.Sent };

            // Mock
            auditMock.Setup(repo => repo.UpdateAudit(It.IsAny<Audit>())).ReturnsAsync((Audit set) => set);

            // Act
            var result = await audit.UpdateAudit(updatedAudit);

            // Assert
            Assert.IsNotNull(result, "Result should not be null");
            Assert.AreEqual(updatedAudit.auditId, result.auditId, "Audit ID should match");
            Assert.AreEqual(updatedAudit.auditStatus, result.auditStatus, "Audit Status should be updated");

            auditMock.Verify(repo => repo.UpdateAudit(It.Is<Audit>(a =>
                a.auditId == updatedAudit.auditId && a.auditStatus == updatedAudit.auditStatus)), Times.Once);
        }






    }
}
