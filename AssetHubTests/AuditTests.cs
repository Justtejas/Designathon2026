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
                new AuditsDto { AuditId = 1},
                new AuditsDto { AuditId = 2}
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
                AuditId = 3,
                assetId = 1,
                userId = 2,
                AuditDate = DateTime.Now,
                AuditMessage = "Test audit"
            };

            var newAudit = new Audit
            {
                AuditId = newAuditDto.AuditId,
                assetId = newAuditDto.assetId,
                userId = newAuditDto.userId,
                AuditDate = newAuditDto.AuditDate,
                AuditMessage = newAuditDto.AuditMessage
            };

            auditMock.Setup(repo => repo.AddAduit(It.IsAny<AuditsDto>()))
                .ReturnsAsync(newAudit);

            var result = await audit.AddAduit(newAuditDto);

            Assert.IsNotNull(result, "Result should not be null");
            Assert.AreEqual(newAuditDto.AuditId, result.AuditId, "AuditId should match");
            Assert.AreEqual(newAuditDto.assetId, result.assetId, "assetId should match");
            Assert.AreEqual(newAuditDto.userId, result.userId, "userId should match");

            auditMock.Verify(repo => repo.AddAduit(It.Is<AuditsDto>(a =>
                a.AuditId == newAuditDto.AuditId && a.assetId == newAuditDto.assetId && a.userId == newAuditDto.userId)), Times.Once);
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
            var updatedAudit = new Audit { AuditId = 1, Audit_Status = AuditStatus.Sent };

            // Mock
            auditMock.Setup(repo => repo.UpdateAudit(It.IsAny<Audit>())).ReturnsAsync((Audit set) => set);

            // Act
            var result = await audit.UpdateAudit(updatedAudit);

            // Assert
            Assert.IsNotNull(result, "Result should not be null");
            Assert.AreEqual(updatedAudit.AuditId, result.AuditId, "Audit ID should match");
            Assert.AreEqual(updatedAudit.Audit_Status, result.Audit_Status, "Audit Status should be updated");

            auditMock.Verify(repo => repo.UpdateAudit(It.Is<Audit>(a =>
                a.AuditId == updatedAudit.AuditId && a.Audit_Status == updatedAudit.Audit_Status)), Times.Once);
        }






    }
}
