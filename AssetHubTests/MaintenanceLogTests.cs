using Hexa_Hub.DTO;
using Hexa_Hub.Interface;
using Moq;
using NUnit.Framework.Internal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssetHubTests
{
    public class MaintenanceLogTests
    {
        private IMaintenanceLogRepo _repo;
        private Mock<IMaintenanceLogRepo> _repoMock;

        [SetUp]
        public void SetUp()
        {
            _repoMock = new Mock<IMaintenanceLogRepo>();
            _repo = _repoMock.Object;
        }

        [TestCase]
        public async Task ReturnsAllMaintenanceLog()
        {
            var expectedMaintenanceLog = new List<MaintenanceLog>()
            {
                new MaintenanceLog{maintenanceId = 1,maintenanceDescription = "Test Log 1", userId= 8},
                new MaintenanceLog{maintenanceId = 2,maintenanceDescription = "Test Log 2", userId = 9}
            };

            _repoMock.Setup(ml => ml.GetAllMaintenanceLog())
                .ReturnsAsync(expectedMaintenanceLog);

            var result = await _repo.GetAllMaintenanceLog();

            Assert.IsNotNull(result, "Result should not be null");
            Assert.AreEqual(2, result.Count, "There Should be 2 Results");
            Assert.AreEqual("Test Log 1", result[0].maintenanceDescription);
            Assert.AreEqual("Test Log 2", result[1].maintenanceDescription);
        }

        [TestCase]
        public async Task ReturnsAllLogById()
        {
            var id = 1;
            var expectedMaintenanceLog = new List<MaintenanceLog>()
            {
                new MaintenanceLog{maintenanceId = 1,maintenanceDescription = "Test Log 1", userId= id},
                new MaintenanceLog{maintenanceId = 2,maintenanceDescription = "Test Log 2", userId = id}
            };
            _repoMock.Setup(ml => ml.GetMaintenanceLogById(id))
                .ReturnsAsync(expectedMaintenanceLog);

            var result = await _repo.GetMaintenanceLogById(id);

            Assert.IsNotNull(result, "Result should not be null");
            Assert.AreEqual(expectedMaintenanceLog.Count, result.Count, "The no of logs should be same");
        }

        [TestCase]
        public async Task AddMaintenanceLog()
        {
            var Log = new MaintenanceLog { maintenanceId = 3, maintenanceDescription = "Test Log 1", userId = 8 };

            _repoMock.Setup(ml => ml.AddMaintenanceLog(Log))
                .Callback((MaintenanceLog maintenanceLog) => { });

            await _repo.AddMaintenanceLog(Log);

            _repoMock.Verify(ml => ml.AddMaintenanceLog(It.Is<MaintenanceLog>(m => m.maintenanceId == Log.maintenanceId && m.maintenanceDescription == Log.maintenanceDescription)), Times.Once);
        }

        [TestCase]
        public async Task UpdateLog()
        {
            var Log = new MaintenanceClassDto { maintenanceId = 3, maintenanceDescription = "Test Log 1", userId = 8 };

            _repoMock.Setup(ml => ml.UpdateMaintenanceLog(Log)).ReturnsAsync(true);

            var result = await _repo.UpdateMaintenanceLog(Log);

            Assert.IsNotNull(result, "Result should not be null");
            Assert.IsTrue(result, "Result is same");
        }

        [TestCase]
        public async Task DeleteLog()
        {
            var id = 1;
            _repoMock.Setup(ml => ml.DeleteMaintenanceLog(id))
                .Callback<int>(id => { });

            await _repo.DeleteMaintenanceLog(id);

            _repoMock.Verify(ml => ml.DeleteMaintenanceLog(It.Is<int>(m => m == id)), Times.Once);
        }

        [TestCase]
        public async Task SaveLog()
        {
            await _repo.Save();
            _repoMock.Verify(ml => ml.Save(), Times.Once);
        }
    }
}
