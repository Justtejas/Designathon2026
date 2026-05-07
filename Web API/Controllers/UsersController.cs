using Hexa_Hub.DTO;
using Hexa_Hub.Exceptions;
using Hexa_Hub.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;
using static Hexa_Hub.Models.MultiValues;

namespace Hexa_Hub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepo _userRepo;
        private readonly DataContext _context;
        private readonly iLoggerService _log;

        public UsersController(DataContext context, IUserRepo userRepo, iLoggerService iLogger)
        {
            _context = context;
            _userRepo = userRepo;
            _log = iLogger;
        }

        // GET: api/users
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            _log.LogInfo("Fetching all users");
            return await _userRepo.GetAllUser();
        }

        [HttpGet("role")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<User>>> GetUsersByRole([FromQuery] UserType role)
        {
            _log.LogInfo("Fetching users by Role");
            var users = await _userRepo.GetUsersByRole(role);
            if (users == null || !users.Any())
            {
                _log.LogDebug("Error Fetching users");

                return NotFound("No users found with the specified role.");
            }
            return Ok(users);
        }



        [HttpGet("profile")]
        [Authorize]
        public async Task<ActionResult<User>> GetUserProfile()
        {
            var currentuserId = User.FindFirstValue(ClaimTypes.userIdentifier);

            if (int.TryParse(currentuserId, out int userId))
            {
                var user = await _userRepo.GetUserById(userId);
                if (user == null)
                {
                    return NotFound("User not Found");
                }
                var userDto = new UserDto
                {
                    userId = user.userId,
                    userName = user.userName,
                    userMail = user.userMail,
                    Gender = user.Gender,
                    dept = user.dept,
                    designation = user.designation,
                    phoneNumber = user.phoneNumber,
                    address = user.address,
                    branch = user.branch,
                    User_Type = user.User_Type?.ToString(),
                    ProfileImage = user.ProfileImage
                };

                return Ok(userDto);
            }

            return BadRequest("Invalid user ID.");
        }





        // GET: api/users/5
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            //var user = await _userRepo.GetUserById(id);
            var user = await _userRepo.GetuserId(id);

            if (user == null)
            {
                return NotFound("User not Found");
            }

            return user;
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateUserDetails(int id, UserDto userDto)
        {
            if (id != userDto.userId)
            {
                _log.LogDebug("Id doesnt match");
                return BadRequest("Check Id");
            }
            var currentuserId = User.FindFirstValue(ClaimTypes.userIdentifier);

            if (id.ToString() != currentuserId && !User.IsInRole("Admin"))
            {
                _log.LogDebug("Role doesnt match");
                return Forbid("You do not have permission to update this user.");
            }
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                _log.LogDebug("User Not found");

                return NotFound("User not Found");
            }

            user.userName = userDto.userName;
            user.userMail = userDto.userMail;
            user.Gender = userDto.Gender;
            user.dept = userDto.dept;
            user.designation = userDto.designation;
            user.phoneNumber = userDto.phoneNumber;
            user.address = userDto.address;
            user.branch = userDto.branch;
            user.ProfileImage = userDto.ProfileImage;

            if (User.IsInRole("Admin"))
            {
                if (Enum.TryParse<UserType>(userDto.User_Type, out var parsedUserType))
                {
                    user.User_Type = parsedUserType;
                }
                else
                {
                    _log.LogDebug("Role doesnt match");
                    return BadRequest($"Invalid User_Type value: {userDto.User_Type}");
                }
            }

            else
            {
                user.User_Type = user.User_Type;
            }
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                if (!UserExists(id))
                {
                    _log.LogError("Id doesnt match", ex);
                    return NotFound("User not Found");
                }
                else
                {
                    _log.LogError("Id doesnt match", ex);
                    throw;
                }
            }
            _log.LogInfo("Updation Success");
            return Ok("Updation Successfull");
        }

        [HttpPut("{id}/password")]
        [Authorize]
        public async Task<IActionResult> ChangeUserPassword(int id, PasswordDto passwordChangeDto)
        {
            if (id != passwordChangeDto.userId)
            {
                _log.LogDebug("User Not found");

                return BadRequest("Check Your Id");
            }
            var currentuserId = User.FindFirstValue(ClaimTypes.userIdentifier);

            if (id.ToString() != currentuserId)
            {
                _log.LogDebug("User Not found");

                return Forbid("Check your Id ");
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                _log.LogDebug("User Not found");

                return NotFound("User not Found");
            }

            if (user.Password != passwordChangeDto.CurrentPassword)
            {
                _log.LogDebug("Password Doesnt mtach");

                return Unauthorized("Current password is incorrect.");
            }

            user.Password = passwordChangeDto.NewPassword;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                if (!UserExists(id))
                {
                    _log.LogError("User Not found", ex);

                    return NotFound("Id not Found");
                }
                else
                {
                    _log.LogError("User Not found", ex);

                    throw;
                }
            }
            _log.LogInfo($"Password Changed by {user.userId}");
            return Ok("Password Changed Successfully");
        }

       

        // POST: api/users
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<User>> PostUser([FromBody]UserRegisterDto dto)
        {
            if (!ModelState.IsValid)
            {
                _log.LogDebug($"{ModelState}");
                return BadRequest(ModelState);
            }

            var user = await _userRepo.RegisterUser(dto);
            _log.LogInfo("User Registered Successfully");

            return CreatedAtAction("GetUser", new { id = user.userId }, user);
            
        }

        // DELETE: api/users/5

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            _log.LogInfo("Deleting User Has Started");

            var user = await _userRepo.GetUserById(id);
            if (user == null)
            {
                _log.LogDebug("Id Doesnt mtach");

                return NotFound("Id Not Found");
            }

            try
            {
                await _userRepo.DeleteUser(id);
                await _userRepo.Save();
            }
            catch (UserNotFoundException ex)
            {
                _log.LogDebug("Id Not found");

                return NotFound(ex.Message);
            }
            _log.LogInfo("User deleted");

            return Ok($"{id} Has been deleted");
        }

        private bool UserExists(int id)
        {
            return _context.Users.Any(e => e.userId == id);
        }


        [HttpPut("{userId}/upload")]
        [Authorize]
        public async Task<IActionResult> UploadProfileImage(int userId, IFormFile file)
        {
            var loggedUser = int.Parse(User.FindFirst(ClaimTypes.userIdentifier)?.Value);
            if (loggedUser != userId)
            {
                return Unauthorized("You are not authorized to update this image.");
            }


             if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            var supportedFiles = new[] { "image/jpeg", "image/png" };
            if (!supportedFiles.Contains(file.ContentType))
            {
                return BadRequest("Only JPEG or PNG formats are allowed.");
            }

            var fileName = await _userRepo.UploadProfileImage(userId, file);
            if (fileName == null)
            {
                return NotFound("User profile not found.");
            }

            return Ok(new { FileName = fileName });
        }


        [Authorize]
        [HttpGet("{userId}/profileImage")]
        public async Task<IActionResult> GetProfileImage(int userId)
        {
            var userProfile = await _userRepo.GetUserById(userId);
            if (userProfile == null || userProfile.ProfileImage == null)
            {
                var defaultImagePath = _userRepo.GetImagePath("profile-img.jpg");
                return PhysicalFile(Path.Combine(Directory.GetCurrentDirectory(), defaultImagePath), "image/jpeg");
            }
            string fileName = Encoding.UTF8.GetString(userProfile.ProfileImage);
            string imagePath = Path.Combine(Directory.GetCurrentDirectory(), _userRepo.GetImagePath(fileName));

            if (!System.IO.File.Exists(imagePath))
            {
                return NotFound("Image file not found.");
            }

            string contentType = Path.GetExtension(fileName).ToLowerInvariant() switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                _ => "application/octet-stream"
            };

            return PhysicalFile(imagePath, contentType);



}
    }
}
