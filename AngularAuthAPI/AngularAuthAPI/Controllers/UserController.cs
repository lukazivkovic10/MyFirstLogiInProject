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

        [HttpGet("IskanjeListaVseh")]
        public async Task<ActionResult<Response<object>>> GetAllItems()
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            IEnumerable<Items> items = await SelectAllItems(connection);
            ////Preveri
            if (items == null )
            {
                //Error 404
                var erorrResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Podatki ne obstajajo",
                    Data = "404"
                };

                return erorrResponse;
            }else
            {
                //Uspesno

                DateTime currentDate = DateTime.Now;
                List<Items> data = new List<Items>();

                foreach (var item in items)
                {
                    if (currentDate > item.CompleteDate)
                    {
                        PosodobiStatus(connection, item.Id, 2);
                    }
                    else if (currentDate < item.CompleteDate)
                    {
                        PosodobiStatus(connection, item.Id, 1);
                    }

                    data.Add(item);
                }
                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Pridobljeni podatki.",
                    Data = data
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
                    Message = "Podatki ne obstajajo",
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
                    Message = "Pridobljeni podatki.",
                    Data = data
                };

                return successResponse;
            }
        }

        [HttpGet("IskanjeLista/{SearchedItem}")]
        public async Task<ActionResult<Response<object>>> GetItems(string SearchedItem)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var existsWithTag = connection.ExecuteScalar<bool>("select count(1) from Items where Tag = @SearchedItem", new { SearchedItem });

            if (existsWithTag)
            {
                var data = await connection.QueryAsync<Items>("select * from Items where Tag = @SearchedItem", new { SearchedItem });
                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Pridobljeni podatki.",
                    Data = data
                };

                return successResponse;
            }
            else
            {
                var existsWithItemName = connection.ExecuteScalar<bool>("select count(1) from Items where ItemName = @SearchedItem", new { SearchedItem });

                if (existsWithItemName)
                {
                    var data = await connection.QueryAsync<Items>("select * from Items where ItemName = @SearchedItem", new { SearchedItem });
                    var successResponse = new Response<object>
                    {
                        Success = true,
                        Error = 200,
                        Message = "Pridobljeni podatki.",
                        Data = data
                    };

                    return successResponse;
                }
                else
                {
                    //Error 404
                    var errorResponse = new Response<object>
                    {
                        Success = false,
                        Error = 404,
                        Message = "Podatki ne obstajajo",
                        Data = "404"
                    };

                    return errorResponse;
                }
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
            }
            else
            {
                await connection.ExecuteAsync("update Items set ItemName = @ItemName, ItemDesc = @ItemDesc where Tag = @Tag and ItemName = @ItemName", items);
                IEnumerable<Items> data = await SelectAllItems(connection);
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

        [HttpPut("UpdateStatus")]
        public async Task<ActionResult<Response<object>>> UpdateStatus(Items items)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));

            var exists = connection.ExecuteScalar<bool>("SELECT COUNT(1) FROM Items WHERE ItemName = @ItemName AND Tag = @Tag", new { items.ItemName, items.Tag });

            if (!exists)
            {
                var errorResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Bad Request - Item not found",
                    Data = "404"
                };

                return errorResponse;
            }
            else
            {
                var currentItem = connection.QuerySingleOrDefault<Items>("SELECT ItemDesc FROM Items WHERE ItemName = @ItemName AND Tag = @Tag", new { items.ItemName, items.Tag });
                items.ItemDesc = currentItem.ItemDesc;

                // Update the CompleteDate
                await connection.ExecuteAsync("UPDATE Items SET Active = @Active, ItemStatus = 1 WHERE Tag = @Tag AND ItemName = @ItemName", new { items.Active, items.Tag, items.ItemName });

                var data = await SelectAllItems(connection);

                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Success - Data retrieved.",
                    Data = data
                };

                return successResponse;
            }
        }

        [HttpPut("UpdateDate")]
        public async Task<ActionResult<Response<object>>> UpdateDate(Items items)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));

            var exists = connection.ExecuteScalar<bool>("SELECT COUNT(1) FROM Items WHERE ItemName = @ItemName AND Tag = @Tag", new { items.ItemName, items.Tag });

            if (!exists)
            {
                var errorResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Bad Request - Item not found",
                    Data = "404"
                };

                return errorResponse;
            }
            else
            {
                var currentItem = connection.QuerySingleOrDefault<Items>("SELECT ItemDesc FROM Items WHERE ItemName = @ItemName AND Tag = @Tag", new { items.ItemName, items.Tag });
                items.ItemDesc = currentItem.ItemDesc;

                // Update the CompleteDate
                await connection.ExecuteAsync("UPDATE Items SET CompleteDate = @CompleteDate WHERE Tag = @Tag AND ItemName = @ItemName", new { items.CompleteDate, items.Tag, items.ItemName });

                var data = await SelectAllItems(connection);

                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Success - Data retrieved.",
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
                    Message = "Iskano ne obstaja",
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
                    Message = "Pridobljeni podatki.",
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
                    Message = "Iskano ne obstaja",
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
                    Message = "Pridobljeni podatki.",
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
                    Message = "Ime že obstaja",
                    Data = "400"
                };

                return erorrResponse;
            }else
            {
                var item = await connection.ExecuteAsync("if not exists (select * from items where ItemName = @ItemName and Tag = @Tag) insert into Items (Tag, ItemName, ItemDesc, Active, ItemStatus, CreatedDate, CompleteDate) values (@Tag, @ItemName, @ItemDesc, @Active, @ItemStatus, @CreatedDate, @CompleteDate)", items);
                IEnumerable<Items> data = await SelectAllItems(connection);
                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Pridobljeni podatki.",
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
                    Message = "Pridobljeni podatki.",
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
                    Message = "Ime ne obstaja",
                    Data = "404"
                };

                return erorrResponse;
            }
        }

        ///Tags 

        [HttpGet("VseTags")]

        public async Task<ActionResult<Response<object>>> GetAllTags()
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select * from Tags");
            ////Preveri
            if (exists == false)
            {
                //Error 404
                var erorrResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Podatki ne obstajajo",
                    Data = "404"
                };

                return erorrResponse;
            }
            else
            {
                //Uspesno
                var data = await connection.QueryAsync<Tags>("select * from Tags");
                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Pridobljeni podatki.",
                    Data = data
                };

                return successResponse;
            }
        }


        [HttpPost("UstvarjanjeTag")]
        public async Task<ActionResult<Response<object>>> CreateTag(Tags tags)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select count(1) from Tags where TagName = @TagName", new { tags.TagName });
            if (exists == true)
            {
                //Error 400
                var erorrResponse = new Response<object>
                {
                    Success = false,
                    Error = 400,
                    Message = "Ime že obstaja",
                    Data = "400"
                };

                return erorrResponse;
            }
            else
            {
                var item = await connection.ExecuteAsync("if not exists (select * from Tags where TagName = @TagName) insert into Tags (TagName) values (@TagName)", tags);
                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Oznaka narejena.",
                    Data = item
                };

                return successResponse;
            }
        }

        [HttpPut("IzbrisTag")]

        public async Task<ActionResult<Response<object>>> DeleteTag(Tags tags)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select count(1) from Tags where TagName = @TagName", new { tags.TagName });
            if (exists == true)
            {
                await connection.ExecuteAsync("Delete from Tags where TagName = @TagName and TagId = @TagId", tags);
                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Pridobljeni podatki.",
                    Data = null
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
                    Message = "Ime ne obstaja",
                    Data = "404"
                };

                return erorrResponse;
            }
        }

        private void PosodobiStatus(SqlConnection connection, int itemId, int itemStatus)
        {
            // Adjust your SQL query to perform the update
            string query = "UPDATE Items SET ItemStatus = @itemStatus WHERE Id = @itemId AND Active <> 0 AND ItemStatus <> 0";
            connection.Execute(query, new { itemStatus, itemId });
        }
        private static async Task<IEnumerable<Items>> SelectAllItems(SqlConnection connection)
        {
            return await connection.QueryAsync<Items>("select * from Items order by Tag");
        }
    }
}
