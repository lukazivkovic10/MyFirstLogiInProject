using Microsoft.AspNetCore.Mvc;
using Dapper;
using AngularAuthAPI.Models;
using AngularAuthAPI.Dtos;
using Microsoft.AspNetCore.Authorization;
using Npgsql;
using AngularAuthAPI.Context;
using Microsoft.EntityFrameworkCore;

namespace AngularAuthAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class userProfileController : ControllerBase
    {
        private readonly AppDbContext _config;
        private readonly ILogger<userProfileController> _logger;

        public userProfileController(AppDbContext configuration, ILogger<userProfileController> logger)
        {
            _config = configuration;
            _logger = logger;
        }

        //User Assigned Items
        [HttpGet("userAssigned")]
        public async Task<ActionResult<Response<object>>> GetUserAssignedItems(string email)
        {
            _logger.LogInformation("----userAssignedItems----");
            using var connection = new NpgsqlConnection(_config.Database.GetDbConnection().ConnectionString);

            var assignedItems = await connection.QueryAsync<AssignedUsers>("select * from \"AssignedUsers\" where \"UserMail\" = @email", new { email });
            _logger.LogInformation("Assigned items: " + assignedItems);

            if (assignedItems == null || !assignedItems.Any())
            {
                //Error 404
                var erorrResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Podatki ne obstajajo",
                    Data = "404 - Podatki ne obstajajo"
                };

                _logger.LogInformation("Error 404: " + erorrResponse.Message);
                return erorrResponse;
            }
            else
            {
                //Uspesno
                var itemNames = assignedItems.Select(item => item.ItemName).ToArray();
                var tags = assignedItems.Select(item => item.Tag).ToArray();

                var matchingItems = await connection.QueryAsync<Items>(
                "SELECT * FROM \"Items\" WHERE \"ItemName\" = ANY(@itemNames) AND \"Tag\" = ANY(@tags)",
                new { itemNames, tags }
                );


                if (!matchingItems.Any())
                {
                    // Error 404 - No matching items found
                    var errorResponse = new Response<object>
                    {
                        Success = false,
                        Error = 404,
                        Message = "Ni bilo najdenih nobenih opravil za ta račun.",
                        Data = null
                    };

                    _logger.LogInformation("Error 404: " + errorResponse.Message);
                    return errorResponse;
                }


                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Pridobljeni podatki.",
                    Data = matchingItems
                };
                _logger.LogInformation("Success: " + successResponse.Message);

                return successResponse;
            }
        }

        //User Created Items
        [HttpGet("userCreated")]
        public async Task<ActionResult<Response<object>>> GetUserCreatedItems(string email)
        {
            _logger.LogInformation("----userCreatedItems----");
            using var connection = new NpgsqlConnection(_config.Database.GetDbConnection().ConnectionString);

            var createdItems = await connection.QueryAsync<Items>("select * from \"Items\" where \"CreatedBy\" = @email", new { email });
            _logger.LogInformation("Created items: " + createdItems);

            if (createdItems == null || !createdItems.Any())
            {
                //Error 404
                var erorrResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Podatki ne obstajajo",
                    Data = "404 - Podatki ne obstajajo"
                };

                _logger.LogInformation("Error 404: " + erorrResponse.Message);
                return erorrResponse;
            }
            else
            {
                //Uspesno
                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Pridobljeni podatki.",
                    Data = createdItems
                };
                _logger.LogInformation("Success: " + successResponse.Message);

                return successResponse;
            }
        }

        //User Details
        [HttpGet("userDetails")]
        public async Task<ActionResult<Response<object>>> GetUserDetails(string email)
        {
            _logger.LogInformation("----userDetails----");
            using var connection = new NpgsqlConnection(_config.Database.GetDbConnection().ConnectionString);

            var userId = await connection.QueryFirstOrDefaultAsync<int>("select \"Id\" from \"uporabniki\" where \"Email\" = @email", new { email });

            if(userId == 0)
            {
                //Error 404
                var errorResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Račun ne obstaja!",
                    Data = "404 - Račun ne obstaja!"
                };

                _logger.LogInformation("Error 404: " + errorResponse.Message);
                return errorResponse;
            }else
            {
                var userDetails = await connection.QueryFirstOrDefaultAsync<UserDto>("select * from \"uporabniki\" where \"Id\" = @Id", new { Id = userId });

                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Pridobljeni podatki.",
                    Data = userDetails
                };

                _logger.LogInformation("Success: " + successResponse.Message);

                return successResponse;
            }
        }
    }
}
