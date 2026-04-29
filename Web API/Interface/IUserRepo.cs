using Hexa_Hub.DTO;
using Hexa_Hub.Repository;
using static Hexa_Hub.Models.MultiValues;

namespace Hexa_Hub.Interface
{
    public interface IUserRepo
    {
        Task<List<User>> GetAllUser();
        Task<User?> GetUserById(int id);
        Task<User?> GetUserId(int id);
        Task<User> UpdateUser(User user);
        Task DeleteUser(int id);
        Task Save();
        Task<IEnumerable<User>> GetUsersByRole(UserType role);
        Task<User?> validateUser(string email, string password);
        Task<User> RegisterUser(UserRegisterDto dto);
        Task<List<User>> GetUsersByAdmin();
        Task<string?> UploadProfileImage(int userId, IFormFile file);
        //string GetDefaultImagePath();

        public string GetImagePath(string fileName);
    }
}
