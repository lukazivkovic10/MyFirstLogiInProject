using AngularAuthAPI.Context;
using AngularAuthAPI.Helper;
using AngularAuthAPI.Models;
using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.IdentityModel.Tokens;
using Microsoft.VisualBasic;
using System;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace AngularAuthAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        ///PRIJAVA IN REGISTRACIJA
        private readonly AppDbContext _authContext;
        private readonly IConfiguration _config;
        public UserController(AppDbContext appDbContext, IConfiguration configuration)
        {
            _authContext = appDbContext;
            _config = configuration;
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
                        return NotFound(new { Message = "Napačni epoštni naslov!" });//Vrne Not Found(Error: 404)
                    }
                    else
                    {
                    if (!PasswordHasher.VerifyPassword(userObj.Password, user.Password))
                    {
                        return BadRequest(new { Message = "Geslo ni pravilno" });
                    }
                    else

                        user.Token = CreateJwtToken(user);
                        return Ok(new { 
                            Token = user.Token,
                            Message = "Prijava uspela!" 
                        });//Vrne OK(200)
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
            if (!Regex.IsMatch(email, "[@]") && !Regex.IsMatch(email, "[@]"))
            {
                sb.Append("Ni veljavna elektronska pošta.");
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

        ///TO DO LIST
        [HttpGet("IskanjeLista")]
        public async Task<ActionResult<Response<object>>> GetAllItems()
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select * from Items");
            ////Preveri
            if (exists == true)
            {
                //Error 404
                var erorrResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "404 Not Found - Podatki ne obstajajo",
                    Data = "404"
                };

                return erorrResponse;
            }else
            {
                //Uspesno
                IEnumerable<Items> items = await SelectAllItems(connection);
                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "200 Success - Pridobljeni podatki.",
                    Data = items
                };

                return successResponse;
            }
        }

        [HttpGet("PrikazOpravljenih")]
        public async Task<ActionResult<Response<object>>> GetAllDoneItems()
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select * from Items where Active = '0' and ItemStatus = '1'");
            ////Preveri
            if (exists == false)
            {
                //Error 404
                var erorrResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "404 Not Found - Podatki ne obstajajo",
                    Data = "404"
                };

                return erorrResponse;
            }
            else
            {
                //Uspesno
                var data = await connection.QueryAsync<Items>("select * from Items where Active = '0' and ItemStatus = '1'");
                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "200 Success - Pridobljeni podatki.",
                    Data = data
                };

                return successResponse;
            }
        }

        [HttpGet("IskanjeLista/{ItemTag}")]

        public async Task<ActionResult<Response<object>>> GetItems(string ItemTag)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select count(1) from Items where Tag = @ItemTag", new {ItemTag});
            ////Preveri
            if (exists == false)
            {
                //Error 404
                var erorrResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "404 Not Found - Podatki ne obstajajo",
                    Data = "404"
                };

                return erorrResponse;
            }
            else
            {
                //Uspesno
                var data = await connection.QueryAsync<Items>("select * from Items where Tag = @Tag",
                new { Tag = ItemTag });
                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "200 Success - Pridobljeni podatki.",
                    Data = data
                };

                return successResponse;
            }
        }

        [HttpPut("Update")]

        public async Task<ActionResult<Response<object>>> UpdateItem(Items items)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select count(1) from Items where ItemName = @ItemName and Tag = @Tag", new { items.ItemName, items.Tag });
            ////Preveri
            if (exists == false)
            {
                var erorrResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Bad Request - Iskano ne obstaja",
                    Data = "404"
                };

                return erorrResponse;
            }else
            {
                await connection.ExecuteAsync("update Items set ItemName = @ItemName, ItemDesc = @ItemDesc where Tag = @Tag and ItemName = @ItemName", items);
                IEnumerable<Items> data = await SelectAllItems(connection);
                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "200 Success - Pridobljeni podatki.",
                    Data = data
                };

                return successResponse;
            }
        }

        [HttpPut("Opravljeno")]

        public async Task<ActionResult<Response<object>>> DoneItem(Items items)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select count(1) from Items where ItemName = @ItemName and Tag = @Tag", new { items.ItemName, items.Tag });
            ////Preveri
            if (exists == false)
            {
                ///Error 404
                var erorrResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Bad Request - Iskano ne obstaja",
                    Data = "404"
                };

                return erorrResponse;
            }else
            {
                await connection.ExecuteAsync("update Items set Active = '0' where ItemName = @ItemName and Tag = @Tag", items);
                IEnumerable<Items> data = await SelectAllItems(connection);
                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "200 Success - Pridobljeni podatki.",
                    Data = data
                };

                return successResponse;
            }
        }

        [HttpPut("NiOpravljeno")]

        public async Task<ActionResult<Response<object>>> NotDoneItem(Items items)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select count(1) from Items where ItemName = @ItemName and Tag = @Tag", new { items.ItemName, items.Tag });
            ////Preveri
            if (exists == false)
            {
                ///Error 404
                var erorrResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Bad Request - Iskano ne obstaja",
                    Data = "404"
                };

                return erorrResponse;
            }
            else
            {
                await connection.ExecuteAsync("update Items set Active = '1' where ItemName = @ItemName and Tag = @Tag", items);
                IEnumerable<Items> data = await SelectAllItems(connection);
                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "200 Success - Pridobljeni podatki.",
                    Data = data
                };

                return successResponse;
            }
        }

        [HttpPost("Ustvarjanje")]
        public async Task<ActionResult<Response<object>>> CreateItem(Items items)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select count(1) from Items where ItemName = @ItemName and Tag = @Tag", new { items.ItemName, items.Tag });
            if(exists == true) 
            {
                //Error 400
                var erorrResponse = new Response<object>
                {
                    Success = false,
                    Error = 400,
                    Message = "Bad Request - Ime že obstaja",
                    Data = "400"
                };

                return erorrResponse;
            }else
            {
                var item = await connection.ExecuteAsync("if not exists (select * from items where ItemName = @ItemName and Tag = @Tag) insert into Items (Tag, ItemName, ItemDesc, Active, ItemStatus) values (@Tag, @ItemName, @ItemDesc, @Active, @ItemStatus)", items);
                IEnumerable<Items> data = await SelectAllItems(connection);
                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "200 Success - Pridobljeni podatki.",
                    Data = data
                };

                return successResponse;
            }
        }

        [HttpDelete("SoftDelete{ItemName}")]

        public async Task<ActionResult<Response<object>>> SoftDeleteItem(string ItemName)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select count(1) from Items where ItemName = @ItemName", new { ItemName });
            if (exists == true)
            {
                await connection.ExecuteAsync("update Items set ItemStatus = '0' where ItemName = @ItemName",
                new { ItemName = ItemName });
                IEnumerable<Items> data = await SelectAllItems(connection);
                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "200 Success - Pridobljeni podatki.",
                    Data = data
                };

                return successResponse;
            }
            else
            {
                ///Error 404
                var erorrResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Bad Request - Ime ne obstaja",
                    Data = "404"
                };

                return erorrResponse;
            }
        }

        private static async Task<IEnumerable<Items>> SelectAllItems(SqlConnection connection)
        {
            return await connection.QueryAsync<Items>("select * from Items order by Tag");
        }
    }
}
