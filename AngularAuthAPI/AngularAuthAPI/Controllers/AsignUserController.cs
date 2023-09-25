﻿using Microsoft.AspNetCore.Mvc;
using Dapper;
using AngularAuthAPI.Dtos;
using AngularAuthAPI.Models;
using Microsoft.Data.SqlClient;
using ntfy;

namespace AngularAuthAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AsignUserController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly ILogger<FileUploadController> _logger;

        public AsignUserController(IConfiguration configuration, ILogger<FileUploadController> logger)
        {
            _config = configuration;
            _logger = logger;
        }

        [HttpPost("DodeliUporabniku")]
        public async Task<ActionResult<Response<object>>> AsignUser(AsignUserDto AUserDto)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var ItemCheck = connection.ExecuteScalar<bool>("select * from Items where Tag = @Tag AND ItemName = @ItemName", new { Tag = AUserDto.Tag, ItemName = AUserDto.ItemName });
            var UserCheck = connection.ExecuteScalar<bool>("select * from Uporabniki where Email = @EmailCheck", new { EmailCheck = AUserDto.Email });
            var UserAlredyInUse = connection.ExecuteScalar<bool>("select * from AssignedUsers where UserMail = @UserMail AND Tag = @Tag AND ItemName = @ItemName", new { Tag = AUserDto.Tag, ItemName = AUserDto.ItemName, UserMail = AUserDto.Email });
            if (!UserCheck || !ItemCheck)
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
            }else if(UserAlredyInUse == false)
            {
                var userId = connection.QueryFirstOrDefault<int>("SELECT Id FROM Uporabniki WHERE Email = @EmailCheck", new { EmailCheck = AUserDto.Email });


                await connection.ExecuteAsync("Insert into AssignedUsers(Tag, ItemName, UserId, UserMail) values (@Tag, @ItemName, @UserId, @UserMail)", new { Tag = AUserDto.Tag, ItemName = AUserDto.ItemName, UserId = userId, UserMail = AUserDto.Email });

                IEnumerable<AssignedUsers> data = await SelectAll(connection, AUserDto.Email);

                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Pridobljeni podatki.",
                    Data = data
                };

                return successResponse;
            }else
            {
                //Error 404
                var erorrResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Upodabniku že dodeljen to opravilo.",
                    Data = "404"
                };

                return erorrResponse;
            }
        }

        [HttpGet("DodeljeniUporabniki")]
        public async Task<ActionResult<Response<object>>> GetAssignedUsers()
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var ItemCheck = connection.ExecuteScalar<bool>("select * from AssignedUsers");
            if (!ItemCheck)
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
                const string query = @"Select * from AssignedUsers";

                var data = await connection.QueryAsync<AssignedUsers>(query);

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

        [HttpGet("MozniUporabniki")]

        public async Task<ActionResult<Response<object>>> GetUsers()
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var userCount = await connection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM Uporabniki");

            if (userCount == 0)
            {
                // No users found, return an error response
                var errorResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Uporabniki ne obstajajo",
                    Data = null // You can set Data to null or omit it in case of an error
                };

                return errorResponse;
            }
            else
            {
                // Users found, you can proceed with fetching user data if needed
                var userData = await connection.QueryAsync<Models.User>("SELECT FirstName, LastName, Email FROM Uporabniki");

                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Pridobljeni podatki.",
                    Data = userData
                };

                return successResponse;
            }
        }

        private static async Task<IEnumerable<AssignedUsers>> SelectAll(SqlConnection connection, string Email)
        {
            return await connection.QueryAsync<AssignedUsers>("select * from AssignedUsers where UserMail = @Email", new {Email = Email});
        }

    }
}
