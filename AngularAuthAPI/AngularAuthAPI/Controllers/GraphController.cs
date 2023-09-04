using AngularAuthAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using System.Data;

namespace AngularAuthAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GraphController : ControllerBase
    {
        private readonly IConfiguration _config;

        public GraphController(IConfiguration configuration)
        {
            _config = configuration;
        }

        [HttpGet("ŠtVsehOpravil")]
        public async Task<ActionResult<Response<object>>> ŠtVsehOpravil()
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));

            var Data = (await connection.ExecuteScalarAsync<int>("SELECT COUNT(*) AS Count FROM Items"));

            return new Response<object>
            {
                Success = true,
                Error = 200,
                Message = "Pridobljeni podatki",
                Data = Data
            };
        }

        [HttpGet("GraphOpravila")]
        public async Task<ActionResult<Response<object>>> GraphOpravila()
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));

            var currentDate = DateTime.Now;
            var threeMonthsAgo = currentDate.AddMonths(-3);


            var query = @"SELECT 
            CASE 
                WHEN ItemStatus = 2 AND Active <> 0 THEN 'Preteklo'
                WHEN (ItemStatus = 1 OR ItemStatus = 2) AND Active = 0 THEN 'Dokončano'
                WHEN ItemStatus = 1 AND Active = 1 THEN 'Še ne dokončano'
            END AS Status,
            COUNT(*) AS Count FROM Items WHERE CreatedDate >= @StartDate AND CreatedDate <= @EndDate GROUP BY
            CASE 
                WHEN ItemStatus = 2 AND Active <> 0 THEN 'Preteklo'
                WHEN (ItemStatus = 1 OR ItemStatus = 2) AND Active = 0 THEN 'Dokončano'
                WHEN ItemStatus = 1 AND Active = 1 THEN 'Še ne dokončano'
            END";

            var data = (await connection.QueryAsync(query, new { StartDate = threeMonthsAgo, EndDate = currentDate }))
           .Where(row => row.Status != null && row.Count != null)
           .ToDictionary(row => row.Status, row => (int)row.Count);

            var stackedColumnData = new List<Dictionary<string, object>>();

            foreach (var status in new[] { "Dokončano", "Še ne dokončano", "Preteklo" })
            {
                stackedColumnData.Add(new Dictionary<string, object>
                    {
                       { "name", status },
                       { "data", data.ContainsKey(status) ? data[status] : 0 },
                       { "startingDate", threeMonthsAgo.ToString("yyyy-MM-dd") },
                       { "currentDate", currentDate.ToString("yyyy-MM-dd") }
                    });
            }

            return new Response<object>
            {
                Success = true,
                Data = stackedColumnData
            };
        }

        [HttpGet("Procenti")]
        public async Task<ActionResult<Response<double>>> CompletedTasksPercentage()
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));

            var currentDate = DateTime.Now;
            var lastMonthStartDate = currentDate.AddMonths(-1);

            var completedCount = await connection.ExecuteScalarAsync<int>("SELECT COUNT(*) AS Count FROM Items WHERE ItemStatus = 2 AND Active = 0 AND CreatedDate >= @StartDate AND CreatedDate <= @EndDate", new { StartDate = lastMonthStartDate, EndDate = currentDate });
            var totalCount = await connection.ExecuteScalarAsync<int>("SELECT COUNT(*) AS Count FROM Items WHERE CreatedDate >= @StartDate AND CreatedDate <= @EndDate", new { StartDate = lastMonthStartDate, EndDate = currentDate });

            double percentage = totalCount > 0 ? (completedCount / (double)totalCount) * 100 : 0;

            int roundedPercentage = (int)Math.Round(percentage); // Convert to integer

            return new Response<double>
            {
                Success = true,
                Data = roundedPercentage
            };
        }

        [HttpGet("Top10List")]
        public async Task<ActionResult<Response<object>>> Top10ListOpravljenih()
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));

            const string query = @" SELECT TOP 10 * FROM Items WHERE TimeTakenSeconds != '0' AND Active = '0' ORDER BY TimeTakenSeconds";

            var data = await connection.QueryAsync<Items>(query);

            foreach (var item in data)
            {
                item.FormattedCreatedDate = item.CreatedDate.ToString("yyyy-MM-dd");
                item.FormattedDateOfCompletion = item.DateOfCompletion.ToString("yyyy-MM-dd");

                var seconds = item.TimeTakenSeconds;
                var minutes = seconds / 60;
                var hours = minutes / 60;
                var days = hours / 24;

                hours %= 24;
                minutes %= 60;
                seconds %= 60;

                item.TimeTaken = $"{days} days, {hours} hours, {minutes} minutes, {seconds} seconds";
            }

            return new Response<object>
            {
                Success = true,
                Message = "Uspešno pridobljeni podatki",
                Data = data
            };
        }
    }
}