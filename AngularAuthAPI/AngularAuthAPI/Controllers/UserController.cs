using AngularAuthAPI.Context;
using AngularAuthAPI.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody] User userObj)
        {
                if (userObj.Email == null || userObj.Password == null)
                {
                    return BadRequest(new { Message = "Bad Request" });//Vrne Bad Request(Error: 400)
                }
                else
                {
                    var user = await _authContext.Users
                        .FirstOrDefaultAsync(x => x.Email == userObj.Email && x.Password == userObj.Password);//Preveri če vnešeni podatki obstajajo in so shranjeni v DB
                    if (user == null)//če vrnjen prazno/null
                    {
                        return NotFound(new { Message = "User Not Found!" });//Vrne Not Found(Error: 404)
                    }
                    else
                    {
                        return Ok(new { Message = "Login Success!" });//Vrne OK(200)
                    }
                }
        }

        [HttpPost("Registracija")]
        public async Task<IActionResult> RegisterUser([FromBody] User userObj)
        {
            if(userObj == null)//Preveri če je userObj prazen
            {
                return BadRequest(new { Message = "Ti Šment nekaj je šlo narobe!" });
            }

            await _authContext.Users.AddAsync(userObj);//Doda podatke
            await _authContext.SaveChangesAsync();//Shrani podatke
            return Ok(new {Message = "User Registered!"});//Vrne OK(200)
        }
    }
}
