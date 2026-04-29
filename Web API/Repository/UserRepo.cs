using Hexa_Hub.DTO;
using Hexa_Hub.Exceptions;
using Hexa_Hub.Interface;
using Hexa_Hub.Models;
using log4net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using static Hexa_Hub.Models.MultiValues;

namespace Hexa_Hub.Repository
{
    public class UserRepo : IUserRepo
    {
        //private static readonly ILog log = LogManager.GetLogger(typeof(UserRepo));
        private readonly DataContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly INotificationService _notificationService;
        private readonly iLoggerService _log;
        public UserRepo(DataContext context, IWebHostEnvironment environment, INotificationService notificationService, iLoggerService iLoggerService)
        {
            _context = context;
            _environment = environment;
            _notificationService = notificationService;
            _log = iLoggerService;
        }

        public async Task<User> RegisterUser(UserRegisterDto dto)
        {
            _log.LogInfo("Registering a new user");
            var user = new User
            {
                UserName = dto.UserName,
                UserMail = dto.UserMail,
                PhoneNumber = dto.PhoneNumber,
                Branch = dto.Branch,
                User_Type = Models.MultiValues.UserType.Employee,
                Password = "Hexahub@123"
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            const string defaultImageFileName = "profile-img.jpg";
            const string imagesFolder = "Images";
            string imagePath = Path.Combine(Directory.GetCurrentDirectory(), imagesFolder);
            string defaultImagePath = Path.Combine(imagePath, defaultImageFileName);
            //if (!Directory.Exists(imagePath))
            //{
            //    Directory.CreateDirectory(imagePath);
            //}

            //if (!File.Exists(defaultImagePath))
            //{
            //    string sourcePath = GetDefaultImageSourcePath();
            //    if (!File.Exists(sourcePath))
            //    {
            //        throw new FileNotFoundException("Source default image file not found.", sourcePath);
            //    }
            //    File.Copy(sourcePath, defaultImagePath);
            //}
            //user.ProfileImage = Encoding.UTF8.GetBytes(defaultImageFileName);
            //_context.Users.Update(user);
            //await _context.SaveChangesAsync();
            //await _notificationService.UserProfileCreated(dto.UserMail, dto.UserName, user.Password);
            //return user;
            try
            {
                if (!Directory.Exists(imagePath))
                {
                    Directory.CreateDirectory(imagePath);
                }

                if (!File.Exists(defaultImagePath))
                {
                    string sourcePath = GetDefaultImageSourcePath();
                    if (!File.Exists(sourcePath))
                    {
                        throw new FileNotFoundException("Source default image file not found.", sourcePath);
                    }
                    File.Copy(sourcePath, defaultImagePath);
                }
                user.ProfileImage = Encoding.UTF8.GetBytes(defaultImageFileName);
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
                await _notificationService.UserProfileCreated(dto.UserMail, dto.UserName, user.Password);
                _log.LogInfo("Registered New User");
            }
            catch (Exception ex)
            {
                _log.LogError("Error occured", ex);
                throw;
            }

            return user;
        }

        public async Task DeleteUser(int id)
        {
            _log.LogInfo("DeletingUser");
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                throw new UserNotFoundException($"User with ID {id} Not Found");
            }
            _context.Users.Remove(user);

        }

        public async Task<List<User>> GetAllUser()
        {
            _log.LogInfo("Fetched all users");
            return await _context.Users
                .Include(u => u.AssetAllocations)
                .Include(u => u.ReturnRequests)
                .Include(u => u.AssetRequests)
                .Include(u => u.ServiceRequests)
                .Include(u => u.Audits)
                .Include(u => u.MaintenanceLogs)
                .ToListAsync();
        }

        public async Task<IEnumerable<User>> GetUsersByRole(UserType role)
        {
            _log.LogInfo("Fetching Users by role");
            return await _context.Users.Where(u => u.User_Type == role).ToListAsync();
        }


        public async Task<User?> GetUserId(int id)
        {
            _log.LogInfo("Fetching Users by id");

            return await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == id);
        }

        public async Task<User?> GetUserById(int id)
        {
            _log.LogInfo("Fetching Users by id");

            return await _context.Users
                .Include(u => u.AssetAllocations)
                .Include(u => u.ReturnRequests)
                .Include(u => u.AssetRequests)
                .Include(u => u.ServiceRequests)
                .Include(u => u.Audits)
                .Include(u => u.MaintenanceLogs)
                .FirstOrDefaultAsync(u=>u.UserId==id);
        }

        public async Task Save()
        {
            await _context.SaveChangesAsync();
        }

        public Task<User> UpdateUser(User user)
        {
            _log.LogInfo("Updating Users");
            _context.Users.Update(user);
            return Task.FromResult(user);
        }

        public async Task<User?> validateUser(string email, string password)
        {
            try
            {
                _log.LogInfo("Validating User");
                var user = await _context.Users
                .FirstOrDefaultAsync(vu => EF.Functions.Collate(vu.UserMail, "Latin1_General_BIN") == email &&
                         EF.Functions.Collate(vu.Password, "Latin1_General_BIN") == password);

                if (user != null)
                {
                    _log.LogInfo($"User found: {email}");
                }
                else
                {
                    _log.LogDebug($"User not found: {email}");
                }

                return user;
            }
            catch (Exception ex)
            {
                _log.LogError($"An error occurred while validating user: {email}", ex);
                throw;
            }
        }



        public async Task<string?> UploadProfileImage(int userId, IFormFile file)
        {
            var userProfile = await _context.Users.FindAsync(userId);
            if (userProfile == null)
            {
                return null;
            }


            const string imagesFolder = "Images";
            string imagePath = Path.Combine(Directory.GetCurrentDirectory(), imagesFolder);
            if (!Directory.Exists(imagePath))
            {
                Directory.CreateDirectory(imagePath);
            }

            string fileName;
            if (userProfile.ProfileImage == null && file == null)
            {
                fileName = "profile-img.jpg";
            }
            else if (file != null)
            {
                string extension = Path.GetExtension(file.FileName);
                fileName = $"{userId}{extension}";
                string fullPath = Path.Combine(imagePath, fileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
            }
            else
            {
                return Encoding.UTF8.GetString(userProfile.ProfileImage);
            }
            userProfile.ProfileImage = Encoding.UTF8.GetBytes(fileName);
            await _context.SaveChangesAsync();
            return fileName;

}
        private string GetDefaultImageSourcePath()
        {
            return Path.Combine(Directory.GetCurrentDirectory(), "Images", "profile-img.jpg");
        }
        public string GetImagePath(string fileName)
        {
            return Path.Combine("Images", fileName);
        }

        public async Task<List<User>> GetUsersByAdmin()
        {
            var adminUserType = MultiValues.UserType.Admin;
            return await _context.Users
                .Where(u => u.User_Type == adminUserType)
                    .ToListAsync();
        }
    }
}
