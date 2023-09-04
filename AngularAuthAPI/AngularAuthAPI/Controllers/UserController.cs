using AngularAuthAPI.Context;
using AngularAuthAPI.Dtos;
using AngularAuthAPI.Helper;
using AngularAuthAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;

namespace AngularAuthAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _authContext;
        public UserController(AppDbContext appDbContext)
        {
            _authContext = appDbContext;
        }

        [HttpGet("userList")]
        public ActionResult<IEnumerable<UserDto>> GetUsers()
        {
            var userDtos = _authContext.Users.Select(user => new UserDto
            {
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName
            }).ToList();

            return Ok(userDtos);
        }

        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody] UserCredentialsDto credentials)
        {
            if (credentials.Email == null || credentials.Password == null)
            {
                return BadRequest(new { Message = "Prazna zahtevana polja!" });
            }
            else
            {
                var user = await _authContext.Users
                    .FirstOrDefaultAsync(x => x.Email == credentials.Email);

                if (user == null)
                {
                    return NotFound(new { Message = "Napačni epoštni naslov!" });
                }
                else
                {
                    // Decrypt the provided password
                    string decryptedPassword = DecryptPassword(credentials.Password);

                    if (decryptedPassword == null || !PasswordHasher.VerifyPassword(decryptedPassword, user.Password))
                    {
                        return BadRequest(new { Message = "Geslo ni pravilno" });
                    }
                    else
                    {
                        user.Token = CreateJwtToken(user);
                        return Ok(new
                        {
                            Token = user.Token,
                            Message = "Prijava uspela!"
                        });
                    }
                }
            }
        }

        [HttpPost("Registracija")]
        public async Task<IActionResult> RegisterUser([FromBody] UserRegistrationDto registrationDto)
        {
            if (registrationDto == null)
            {
                return BadRequest(new { Message = "Prazna zahtevana polja!" });
            }

            // Decrypt the provided password
            string decryptedPassword = DecryptPassword(registrationDto.Password);

            if (string.IsNullOrEmpty(decryptedPassword))
            {
                return BadRequest(new { Message = "Neveljavno geslo" });
            }

            // Check password strength
            var passStrengthMessage = CheckPasswordStrength(decryptedPassword);
            if (!string.IsNullOrEmpty(passStrengthMessage))
            {
                return BadRequest(new { Message = passStrengthMessage });
            }

            // Proceed with the registration process
            if (await CheckEmailExistAsync(registrationDto.Email))
            {
                return BadRequest(new { Message = "Elektronska pošta že v uporabi" });
            }

            // Create a User object from the DTO properties
            var userObj = new User
            {
                FirstName = registrationDto.FirstName,
                LastName = registrationDto.LastName,
                Email = registrationDto.Email,
                Password = PasswordHasher.HashPassword(decryptedPassword)
            };

            await _authContext.Users.AddAsync(userObj);
            await _authContext.SaveChangesAsync();

            return Ok(new { Message = "Uporabnik registriran!" });
        }

        private async Task<bool> CheckEmailExistAsync(string email)
        {
            return await _authContext.Users.AnyAsync(x => x.Email == email);
        }

        private string CheckPasswordStrength(string password)
        {
            StringBuilder sb = new StringBuilder();
            if(password.Length < 8)
            {
                sb.Append("Minimalna velikost gesla je 8."+Environment.NewLine);
            }
            if(!(Regex.IsMatch(password,"[a-z]") && Regex.IsMatch(password,"[A-Z]") && Regex.IsMatch(password, "[0-9]")))
            {
                sb.Append("Geslo bi naj vsebovalo vsaj eno malo črko[a-z], eno veliko črko[A-Z] in eno številko[0-9]" + Environment.NewLine);
            }
            if(!Regex.IsMatch(password, "[<,>,@,!,#,$,%,&,/,(,),=,?,*,¨,.,,,-,|,€,\\],\\,\\[,{,},<,>]"))
            {
                sb.Append("Geslo bi naj vsebovalo vsaj eno posebno črko [<,>,@,!,#,$,%,&,/,(,),=,?,*,¨,.,,,-,|,€,\\],\\,\\[,{,},<,>]." + Environment.NewLine);
            }
            return sb.ToString();
        }

        private string CreateJwtToken(User user)
        {
            var jwtTokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes("veryverysceret.....");
            var identity = new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Email,$"{user.Email}")
            });

            var credentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = identity,
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = credentials
            };
            var token = jwtTokenHandler.CreateToken(tokenDescriptor);
            return jwtTokenHandler.WriteToken(token);
        }

        private readonly string encryptionKey = "EncryptionKey";

        public string DecryptPassword(string encryptedPassword)
        {
            try
            {
                byte[] encryptedBytes = Convert.FromBase64String(encryptedPassword);
                string decryptedPasswordWithKey = Encoding.UTF8.GetString(encryptedBytes);

                if (decryptedPasswordWithKey.EndsWith(encryptionKey))
                {
                    string decryptedPassword = decryptedPasswordWithKey.Substring(0, decryptedPasswordWithKey.Length - encryptionKey.Length);
                    return decryptedPassword;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception)
            {
                return null;
            }
        }
    }
}
