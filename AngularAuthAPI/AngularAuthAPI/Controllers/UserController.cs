using AngularAuthAPI.Context;
using AngularAuthAPI.Helper;
using AngularAuthAPI.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using System.ComponentModel.DataAnnotations;
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
        public ActionResult<IEnumerable<User>> GetUsers()
        {
            return Ok(_authContext.Users);
        }

        [HttpPost("authenticate")]
        public async Task<IActionResult> Authenticate([FromBody] User userObj)
        {
                if (userObj.Email == null || userObj.Password == null)
                {
                    return BadRequest(new { Message = "Prazna zahtevana polja!" });//Vrne Bad Request(Error: 400)
                }
                else
                {
                    var user = await _authContext.Users
                        .FirstOrDefaultAsync(x => x.Email == userObj.Email);//Preveri če vnešeni podatki obstajajo in so shranjeni v DB
                    if (user == null)//če vrnjen prazno/null
                    {
                        return NotFound(new { Message = "Napačni podatki!" });//Vrne Not Found(Error: 404)
                    }
                    else
                    {
                    if(!PasswordHasher.VerifyPassword(userObj.Password,user.Password))
                    {
                        return BadRequest(new { Message = "Geslo ni pravilno" });
                    }else
                        return Ok(new { Message = "Prijava uspela!" });//Vrne OK(200)
                    }
                }
        }

        [HttpPost("Registracija")]
        public async Task<IActionResult> RegisterUser([FromBody] User userObj)
        {
            if(userObj == null)//Preveri če je userObj prazen
            {
                return BadRequest(new { Message = "Prazna zahtevana polja!" });
            }
            //Preveri email če ze obstaja
            if(await CheckEmailExistAsync(userObj.Email))
            {
                return BadRequest(new { Message = "Elektronska pošta ze v uporabi" });
            }
            //Preveri obliko email če je veljaven
            var mail = CheckEmailBody(userObj.Email);
            if (!string.IsNullOrEmpty(mail))
            {
                return BadRequest(new { Message = mail.ToString() });
            }

            //Preveri moč gesla
            var pass = CheckPasswordStrength(userObj.Password);
            if(!string.IsNullOrEmpty(pass)) 
            {
                return BadRequest(new {Message = pass.ToString() });
            }

            userObj.Password = PasswordHasher.HashPassword(userObj.Password);//Heshira geslo
            await _authContext.Users.AddAsync(userObj);//Doda podatke
            await _authContext.SaveChangesAsync();//Shrani podatke
            return Ok(new {Message = "Uporabnik registriran!"});//Vrne OK(200)
        }

        private async Task<bool> CheckEmailExistAsync(string email)
        {
            return await _authContext.Users.AnyAsync(x => x.Email == email);
        }

        private string CheckEmailBody(string email)
        {
            StringBuilder sb = new StringBuilder();
            if (!Regex.IsMatch(email, "[@,.]"))
            {
                sb.Append("Ni veljavna elektronska pošta." + Environment.NewLine);
            }
            return sb.ToString();
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
    }
}
