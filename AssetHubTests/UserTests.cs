using Hexa_Hub.DTO;
using Hexa_Hub.Interface;
using Microsoft.AspNetCore.Identity;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssetHubTests
{
    internal class UserTests
    {
        private IUserRepo _userRepo;
        private Mock<IUserRepo> _userRepoMock;

        [SetUp]
        public void SetUp()
        {
            _userRepoMock = new Mock<IUserRepo>();
            _userRepo = _userRepoMock.Object;
        }

        [TestCase]
        public async Task ReturnsAllUsers()
        {
            var expectedUSersList = new List<User>()
            {
                new User{userId = 1,userName = "Test1"},
                new User{userId = 2,userName = "Test2" }
            };

            _userRepoMock.Setup(u => u.GetAllUser())
                .ReturnsAsync(expectedUSersList);

            var result = await _userRepo.GetAllUser();

            Assert.IsNotNull(result, "Result should not be null");
            Assert.AreEqual(2, result.Count, "There Should be 2 Results");
            Assert.AreEqual("Test1", result[0].userName);
            Assert.AreEqual("Test2", result[1].userName);
        }

        [TestCase]
        public async Task AddUser_ShouldRegisterUserSuccessfully()
        {
            var userDto = new UserRegisterDto
            {
                userName = "Test1",
                userMail = "test1@mail.com",
                phoneNumber = "123456789",
                branch = "Mainbranch"
            };

            var expectedUser = new User
            {
                userId = 1, 
                userName = "Test1",
                userMail = "test1@mail.com",
                phoneNumber = "123456789",
                branch = "Mainbranch"
            };

            _userRepoMock.Setup(ml => ml.RegisterUser(It.IsAny<UserRegisterDto>()))
                .ReturnsAsync(expectedUser);
            var result = await _userRepo.RegisterUser(userDto);

            _userRepoMock.Verify(u => u.RegisterUser(It.Is<UserRegisterDto>(
                m => m.userName == userDto.userName
                    && m.userMail == userDto.userMail
                    && m.phoneNumber == userDto.phoneNumber
                    && m.branch == userDto.branch
            )), Times.Once);

            Assert.AreEqual(expectedUser.userName, result.userName);
            Assert.AreEqual(expectedUser.userMail, result.userMail);
            Assert.AreEqual(expectedUser.phoneNumber, result.phoneNumber);
            Assert.AreEqual(expectedUser.branch, result.branch);
        }


        [TestCase]
        public async Task DeleteUser()
        {
            var id = 1;
            _userRepoMock.Setup(u => u.DeleteUser(id))
                .Callback<int>(id => { });

            await _userRepo.DeleteUser(id);

            _userRepoMock.Verify(u => u.DeleteUser(It.Is<int>(m => m == id)), Times.Once);
        }

        [TestCase]
        public async Task GetUserById()
        {
            var id = 1;
            var user = new User { userId = id, userName = "Test1" };

            _userRepoMock.Setup(u => u.GetUserById(id))
                .ReturnsAsync(user);

            var result = await _userRepo.GetUserById(id);

            Assert.IsNotNull(result, "Result should not be null");
            Assert.AreEqual(user.userId, result.userId, "Should match");
            Assert.AreEqual(user.userName, result.userName, "Should Match");
        }

        [TestCase]
        public async Task UpdateUser()
        {
            var user = new User { userId = 3, userName = "Test1" };

            _userRepoMock.Setup(u => u.UpdateUser(user))
                .ReturnsAsync(user);

            var result = await _userRepo.UpdateUser(user);

            Assert.IsNotNull(result, "Result should not be null");
            Assert.AreEqual(user.userId, result.userId, " Id Should Match");
            Assert.AreEqual(user.userId, result.userId, " Name Should Match");
        }

        [TestCase]
        public async Task ValidateUser()
        {
            var email = "test@emaple.com";
            var pass = "Test@123";
            var user = new User { userMail = email, Password = pass };

            _userRepoMock.Setup(u => u.validateUser(email, pass)).ReturnsAsync(user);

            var result = await _userRepo.validateUser(email, pass);
            Assert.IsNotNull(result, "Result should not be null");
            Assert.AreEqual(user.userMail, result.userMail, " Should Match");
            Assert.AreEqual(user.Password, result.Password, " Should Match");
        }
    }
}
