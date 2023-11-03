using AngularAuthAPI.Dtos;
using AngularAuthAPI.Models;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Npgsql;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace AngularAuthAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AnalyticsController
    {
        private readonly IConfiguration _config;
        private readonly ILogger<AnalyticsController> _logger;
        public AnalyticsController(IConfiguration configuration, ILogger<AnalyticsController> logger)
        {
            _config = configuration;
            _logger = logger;
        }

        [HttpGet("ViewsData/{id}")]
        public async Task<ActionResult<Response<object>>> GetViewsData(int id)
        {
            using var connection = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection"));
            await connection.OpenAsync();

            var currentDate = DateTime.Now;
            var oneWeekAgo = currentDate.AddDays(-7);

            var data = new List<object>();

            for (int i = 0; i < 7; i++)
            {
                var startDate = oneWeekAgo.AddDays(i);
                var endDate = startDate.AddDays(1);

                var query = @"Select count(*) as ""ViewCount"" From ""ViewTracking"" Where ""ViewedAt"" >= @StartDate AND ""ViewedAt"" < @EndDate AND ""TodoItemID"" = @TodoId;";

                var param = new { StartDate = startDate, EndDate = endDate, TodoId = id };

                var viewCount = await connection.ExecuteScalarAsync<int>(query, param);

                var dateViewData = new
                {
                    Date = startDate.ToString("yyyy-MM-dd"),
                    Views = viewCount
                };

                data.Add(dateViewData);
            }

            return new Response<object>
            {
                Data = data
            };
        }

        [HttpGet("ViewsData/UserList/{id}")]
        public async Task<ActionResult<Response<object>>> GetUserList(int id)
        {
            using var connection = new NpgsqlConnection(_config.GetConnectionString("DefaultConnection"));
            await connection.OpenAsync();

            var query = @"Select count(*) from ""ViewTracking"" where ""TodoItemID"" = @TodoId;";

            var param = new { TodoId = id };

            var exists = await connection.ExecuteScalarAsync<int>(query, param);

            _logger.LogInformation($"Data exists for TodoItemId {id}: {exists > 0}");

            if (exists > 0)
            {
                var dataQuery = @"
            SELECT VT.""ViewedAt"", VT.""UserID"", U.""Email""
            FROM ""ViewTracking"" VT
            INNER JOIN ""uporabniki"" U ON VT.""UserID"" = U.""Id""
            WHERE VT.""TodoItemID"" = @TodoId";

                _logger.LogInformation($"Retrieved data for TodoItemId {id}");

                var data = await connection.QueryAsync<UserViewDataDto>(dataQuery, new { TodoId = id });

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
                // Error 404
                var erorrResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Opravilo tega Id ne obstaja.",
                    Data = "404"
                };

                return erorrResponse;
            }
        }

    }

}
