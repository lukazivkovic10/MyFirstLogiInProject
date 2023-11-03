using AngularAuthAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using AngularAuthAPI.Dtos;
using Microsoft.Extensions.Logging;
using System.Data;
using Microsoft.AspNetCore.Authorization;
using Npgsql;
using AngularAuthAPI.Context;
using Microsoft.EntityFrameworkCore;

namespace AngularAuthAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ViewsController
    {
        private readonly AppDbContext _config;
        private readonly ILogger<ViewsController> _logger;

        public ViewsController(AppDbContext configuration, ILogger<ViewsController> logger)
        {
            _config = configuration;
            _logger = logger;
        }

        [HttpPost("register-view")]
        public async Task<ActionResult<Response<object>>> RegisterView(ViewDto viewRegistration)
        {
                using var connection = new NpgsqlConnection(_config.Database.GetDbConnection().ConnectionString);

                // Validate and sanitize user inputs to prevent SQL injection
                if (viewRegistration == null || string.IsNullOrWhiteSpace(viewRegistration.UserEmail))
                {
                    var errorResponse =  new Response<object>
                    {
                        Success = false,
                        Error = 400,
                        Message = "Invalid input data",
                    };

                    return errorResponse;
                }

                // Retrieve the user ID
                var userId = await connection.ExecuteScalarAsync<int>(
                    "SELECT \"Id\" FROM \"uporabniki\" WHERE \"Email\" = @UserEmail",
                    new { UserEmail = viewRegistration.UserEmail });

                // Insert a view record into the ViewTracking table
                string viewQuery = @"
                INSERT INTO ""ViewTracking"" (""TodoItemID"", ""UserID"", ""ViewedAt"")
                VALUES (@TodoItemID, @UserID, @ViewedAt)";
                await connection.ExecuteAsync(viewQuery, new
                {
                    TodoItemID = viewRegistration.TodoItemID,
                    UserID = userId,
                    ViewedAt = DateTime.Now
                });

                // Update the ViewCount in the Items table
                string updateQuery = @"
                UPDATE ""Items"" AS i
                SET ""ViewCount"" = COALESCE(i.""ViewCount"", 0) + 1,
                    ""ViewTrackingId"" = nextval('view_tracking_id_sequence')
                FROM ""ViewTracking"" AS t
                WHERE i.""Id"" = @TodoItemId";
                await connection.ExecuteAsync(updateQuery, new { TodoItemId = viewRegistration.TodoItemID });

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
            using var connection = new NpgsqlConnection(_config.Database.GetDbConnection().ConnectionString);
            var exists = await connection.ExecuteScalarAsync<bool>(
                "SELECT COUNT(1) FROM \"Items\" WHERE \"Id\" = @id", new { id });

            if (exists)
            {
                var data = await connection.QueryAsync<int>(
                    "SELECT \"ViewCount\" FROM \"Items\" WHERE \"Id\" = @id", new { id });

                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Data retrieved.",
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
                    Message = "Data does not exist",
                    Data = "404"
                };

                return errorResponse;
            }
        }
    }
            
}
