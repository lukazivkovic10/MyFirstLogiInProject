using AngularAuthAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using AngularAuthAPI.Dtos;
using Microsoft.Extensions.Logging;
using System.Data;
using Microsoft.AspNetCore.Authorization;

namespace AngularAuthAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ViewsController
    {
        private readonly IConfiguration _config;
        private readonly ILogger<ViewsController> _logger;
        public ViewsController(IConfiguration configuration, ILogger<ViewsController> logger)
        {
            _config = configuration;
            _logger = logger;
        }

        [HttpPost("register-view")]
        public async Task<ActionResult<Response<object>>> RegisterView(ViewDto viewRegistration)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var userId = await connection.ExecuteScalarAsync<int>("SELECT Id FROM uporabniki WHERE Email = @UserEmail", new { UserEmail = viewRegistration.UserEmail });

            // Insert a view record into the ViewTracking table
            string viewQuery = "INSERT INTO ViewTracking (TodoItemID, UserID, ViewedAt) VALUES (@TodoItemID, @UserID, @ViewedAt)";
            await connection.ExecuteAsync(viewQuery, new
            {
                TodoItemID = viewRegistration.TodoItemID,
                UserID = userId,
                ViewedAt = DateTime.Now
            });

            // Update the ViewCount in the Items table
            string updateQuery = "UPDATE Items SET ViewCount = ISNULL(ViewCount, 0) + 1, ViewTrackingId = SCOPE_IDENTITY() WHERE Id = @TodoItemID";
            await connection.ExecuteAsync(updateQuery, new { TodoItemID = viewRegistration.TodoItemID });

            var successResponse = new Response<object>
            {
                Success = true,
                Error = 200,
            };

            return successResponse;
        }

        [HttpGet("get-views/{id}")]
        public async Task<ActionResult<Response<object>>> GetViewCount(int id)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select count(1) from Items where Id = @id", new { id });
            if (exists == true)
            {
                var data = await connection.QueryAsync<int>("select ViewCount from Items where Id = @id", new { id });
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
}
