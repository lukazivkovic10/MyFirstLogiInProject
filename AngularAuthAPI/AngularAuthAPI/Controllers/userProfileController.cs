using Microsoft.AspNetCore.Mvc;
using Dapper;
using AngularAuthAPI.Models;
using Microsoft.Data.SqlClient;

namespace AngularAuthAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class userProfileController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly ILogger<userProfileController> _logger;

        public userProfileController(IConfiguration configuration, ILogger<userProfileController> logger)
        {
            _config = configuration;
            _logger = logger;
        }

        [HttpGet("user")]
        public async Task<ActionResult<Response<object>>> GetUserAssignedItems(string email)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));

            var assignedItems = await connection.QueryAsync<AssignedUsers>("select * from AssignedUsers where UserMail = @email", new { email });
            _logger.LogInformation("Assigned items: " + assignedItems);

            if (assignedItems == null || !assignedItems.Any())
            {
                //Error 404
                var erorrResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Podatki ne obstajajo",
                    Data = "404"
                };

                _logger.LogInformation("Error 404: " + erorrResponse);
                return erorrResponse;
            }
            else
            {
                //Uspesno
                var itemNames = assignedItems.Select(item => item.ItemName);
                var tags = assignedItems.Select(item => item.Tag);
                _logger.LogInformation("Item names: " + itemNames);
                _logger.LogInformation("Tags: " + tags);

                var matchingItems = await connection.QueryAsync<Items>(
                "SELECT * FROM Items WHERE ItemName IN @itemNames AND Tag IN @tags",
                new { itemNames, tags }
                );

                _logger.LogInformation("Matching items: " + matchingItems);


                if (!matchingItems.Any())
                {
                    // Error 404 - No matching items found
                    var errorResponse = new Response<object>
                    {
                        Success = false,
                        Error = 404,
                        Message = "No matching items found.",
                        Data = null
                    };

                    _logger.LogInformation("Error 404: " + errorResponse);
                    return errorResponse;
                }


                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Pridobljeni podatki.",
                    Data = matchingItems
                };
                _logger.LogInformation("Success: " + successResponse);

                return successResponse;
            }
        }
    }
}
