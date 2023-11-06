using AngularAuthAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Dapper;
using System.Data;
using Npgsql;
using AngularAuthAPI.Context;
using Microsoft.EntityFrameworkCore;

namespace AngularAuthAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GraphController : ControllerBase
    {
        private readonly AppDbContext _config;
        private readonly ILogger<GraphController> _logger;

        public GraphController(AppDbContext configuration, ILogger<GraphController> logger)
        {
            _config = configuration;
            _logger = logger;
        }

        [HttpGet("ŠtVsehOpravil")]
        public async Task<ActionResult<Response<object>>> ŠtVsehOpravil()
        {
            using var connection = new NpgsqlConnection(_config.Database.GetDbConnection().ConnectionString);

            var query = @"SELECT CASE
                  WHEN ""ItemStatus"" = 2 AND ""Active"" <> 0 THEN 'Preteklo'
                  WHEN (""ItemStatus"" = 1 OR ""ItemStatus"" = 2) AND ""Active"" = 0 THEN 'Dokoncano'
                  WHEN ""ItemStatus"" = 1 AND ""Active"" = 1 THEN 'Nedokoncano'
                  ELSE 'Izbriano'
               END AS ""Status"", 
               COUNT(*) AS ""Count""
               FROM ""Items""
               GROUP BY CASE
                  WHEN ""ItemStatus"" = 2 AND ""Active"" <> 0 THEN 'Preteklo'
                  WHEN (""ItemStatus"" = 1 OR ""ItemStatus"" = 2) AND ""Active"" = 0 THEN 'Dokoncano'
                  WHEN ""ItemStatus"" = 1 AND ""Active"" = 1 THEN 'Nedokoncano'
                  ELSE 'Izbriano'
               END
               UNION ALL
               SELECT 'Vse' AS ""Status"", COUNT(*) AS ""Count""
               FROM ""Items"";";

            var Data = (await connection.QueryAsync(query))
                .Where(row => row.Status != null && row.Count != null)
                .ToDictionary(row => row.Status, row => (int)row.Count); 
            ;

            var dataString = string.Join(", ", Data.Select(kv => $"{kv.Key}: {kv.Value}"));

            _logger.LogInformation($"Št vseh opravil: {dataString}");

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
            using var connection = new NpgsqlConnection(_config.Database.GetDbConnection().ConnectionString);

            var currentDate = DateTime.Now;
            var threeMonthsAgo = currentDate.AddMonths(-3);
            var twoMonthsAgo = currentDate.AddMonths(-2);
            var oneMonthAgo = currentDate.AddMonths(-1);

            var data = new List<Dictionary<string, object>>();

            // Query for the first month
            var queryMonth1 = @"SELECT 
    CASE 
    WHEN ""ItemStatus"" = 2 AND ""Active"" <> 0 THEN 'Preteklo'
    WHEN (""ItemStatus"" = 1 OR ""ItemStatus"" = 2) AND ""Active"" = 0 THEN 'Dokončano'
    WHEN ""ItemStatus"" = 1 AND ""Active"" = 1 THEN 'Še ne dokončano' 
    END AS Status,
    COUNT(*) AS Count FROM ""Items""
    WHERE ""CreatedDate"" >= TO_TIMESTAMP(@StartDate1, 'MM.DD.YYYY') AND ""CreatedDate"" <= TO_TIMESTAMP(@EndDate1, 'MM.DD.YYYY') 
    GROUP BY 
    CASE 
    WHEN ""ItemStatus"" = 2 AND ""Active"" <> 0 THEN 'Preteklo'
    WHEN (""ItemStatus"" = 1 OR ""ItemStatus"" = 2) AND ""Active"" = 0 THEN 'Dokončano'
    WHEN ""ItemStatus"" = 1 AND ""Active"" = 1 THEN 'Še ne dokončano'
    END";

            var dataMonth1 = (await connection.QueryAsync(queryMonth1, new { StartDate1 = threeMonthsAgo, EndDate1 = twoMonthsAgo }))
                .Where(row => row.Status != null && row.Count != null)
                .ToDictionary(row => row.Status, row => (int)row.Count);

            // Ensure zero counts for Month1
            foreach (var status in new[] { "Dokončano", "Še ne dokončano", "Preteklo" })
            {
                if (!dataMonth1.ContainsKey(status))
                {
                    dataMonth1[status] = 0;
                }
            }

            data.Add(new Dictionary<string, object>
            {
                { "name", threeMonthsAgo.ToString("MM.yy") }, 
                { "data", dataMonth1 }, 
                { "startingDate", threeMonthsAgo.ToString("dd.MM.yyyy") }, 
                { "currentDate", twoMonthsAgo.ToString("dd.MM.yyyy") }
            });

            // Query for the second month
            var queryMonth2 = @"SELECT 
    CASE 
    WHEN ""ItemStatus"" = 2 AND ""Active"" <> 0 THEN 'Preteklo'
    WHEN (""ItemStatus"" = 1 OR ""ItemStatus"" = 2) AND ""Active"" = 0 THEN 'Dokončano'
    WHEN ""ItemStatus"" = 1 AND ""Active"" = 1 THEN 'Še ne dokončano'
    END AS Status,
    COUNT(*) AS Count 
    FROM ""Items"" 
    WHERE ""CreatedDate"" >= TO_TIMESTAMP(@StartDate2, 'MM.DD.YYYY') AND ""CreatedDate"" <= TO_TIMESTAMP(@EndDate2, 'MM.DD.YYYY') 
    GROUP BY
    CASE 
    WHEN ""ItemStatus"" = 2 AND ""Active"" <> 0 THEN 'Preteklo'
    WHEN (""ItemStatus"" = 1 OR ""ItemStatus"" = 2) AND ""Active"" = 0 THEN 'Dokončano'
    WHEN ""ItemStatus"" = 1 AND ""Active"" = 1 THEN 'Še ne dokončano'
    END";

            var dataMonth2 = (await connection.QueryAsync(queryMonth2, new { StartDate2 = twoMonthsAgo, EndDate2 = oneMonthAgo }))
                .Where(row => row.Status != null && row.Count != null)
                .ToDictionary(row => row.Status, row => (int)row.Count);

            // Ensure zero counts for Month2
            foreach (var status in new[] { "Dokončano", "Še ne dokončano", "Preteklo" })
            {
                if (!dataMonth2.ContainsKey(status))
                {
                    dataMonth2[status] = 0;
                }
            }

            data.Add(new Dictionary<string, object>
    {
        { "name", twoMonthsAgo.ToString("MM.yy") },
        { "data", dataMonth2 },
        { "startingDate", twoMonthsAgo.ToString("dd.MM.yyyy") },
        { "currentDate", oneMonthAgo.ToString("dd.MM.yyyy") }
    });

            // Query for the third month
            var queryMonth3 = @"SELECT 
    CASE 
    WHEN ""ItemStatus"" = 2 AND ""Active"" <> 0 THEN 'Preteklo'
    WHEN (""ItemStatus"" = 1 OR ""ItemStatus"" = 2) AND ""Active"" = 0 THEN 'Dokončano'
    WHEN ""ItemStatus"" = 1 AND ""Active"" = 1 THEN 'Še ne dokončano'
    END AS Status,
    COUNT(*) AS Count 
    FROM ""Items"" 
    WHERE ""CreatedDate"" >= TO_TIMESTAMP(@StartDate3, 'MM.DD.YYYY') AND ""CreatedDate"" <= TO_TIMESTAMP(@EndDate3, 'MM.DD.YYYY') 
    GROUP BY
    CASE 
    WHEN ""ItemStatus"" = 2 AND ""Active"" <> 0 THEN 'Preteklo'
    WHEN (""ItemStatus"" = 1 OR ""ItemStatus"" = 2) AND ""Active"" = 0 THEN 'Dokončano'
    WHEN ""ItemStatus"" = 1 AND ""Active"" = 1 THEN 'Še ne dokončano'
    END";

            var dataMonth3 = (await connection.QueryAsync(queryMonth3, new { StartDate3 = oneMonthAgo, EndDate3 = currentDate }))
                .Where(row => row.Status != null && row.Count != null)
                .ToDictionary(row => row.Status, row => (int)row.Count);

            // Ensure zero counts for Month3
            foreach (var status in new[] { "Dokončano", "Še ne dokončano", "Preteklo" })
            {
                if (!dataMonth3.ContainsKey(status))
                {
                    dataMonth3[status] = 0;
                }
            }

            data.Add(new Dictionary<string, object>
    {
        { "name", oneMonthAgo.ToString("MM.yy") },
        { "data", dataMonth3 },
        { "startingDate", oneMonthAgo.ToString("dd.MM.yyyy") },
        { "currentDate", currentDate.ToString("dd.MM.yyyy") }
    });
            _logger.LogInformation($"---Graph-Opravila---" + " currentDate: " + currentDate + " threeMonthsAgo: " + threeMonthsAgo + " twoMonthsAgo: " + twoMonthsAgo + " oneMonthAgo: " + oneMonthAgo);
            return new Response<object>
            {
                Success = true,
                Data = data
            };
        }

        [HttpGet("Procenti")]
        public async Task<ActionResult<Response<double>>> CompletedTasksPercentage()
        {
            using var connection = new NpgsqlConnection(_config.Database.GetDbConnection().ConnectionString);

            var currentDate = DateTime.Now;
            var lastMonthStartDate = currentDate.AddMonths(-1);

            var completedCount = await connection.ExecuteScalarAsync<int>("SELECT COUNT(*) AS Count FROM \"Items\" WHERE (\"ItemStatus\" = 2 OR \"ItemStatus\" = 1) AND \"Active\" = 0 AND \"CreatedDate\" >= @StartDate AND \"CreatedDate\" <= @EndDate", new { StartDate = lastMonthStartDate, EndDate = currentDate });
            var totalCount = await connection.ExecuteScalarAsync<int>("SELECT COUNT(*) AS Count FROM \"Items\" WHERE \"CreatedDate\" >= @StartDate AND \"CreatedDate\" <= @EndDate", new { StartDate = lastMonthStartDate, EndDate = currentDate });

            double percentage = totalCount > 0 ? (completedCount / (double)totalCount) * 100 : 0;


            int roundedPercentage = (int)Math.Round(percentage); // Convert to integer

            _logger.LogInformation("---Procenti_GRAF--- " + $"roundedPercentage: {roundedPercentage} " + $"currentDate: {currentDate} " + $"lastMonthStartDate: {lastMonthStartDate} " + $"completedCount: {completedCount} " + $"totalCount: {totalCount} " + $"percentage: {percentage} ");

            return new Response<double>
            {
                Success = true,
                Data = roundedPercentage
            };
        }

        [HttpGet("Top10List")]
        public async Task<ActionResult<Response<object>>> Top10ListOpravljenih()
        {
            using var connection = new NpgsqlConnection(_config.Database.GetDbConnection().ConnectionString);

            const string query = @" SELECT * FROM ""Items"" WHERE ""TimeTakenSeconds"" != '0' AND ""Active"" = '0' ORDER BY ""TimeTakenSeconds"" LIMIT 10;";

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

                item.TimeTaken = $"{days} dneh, {hours} urah, {minutes} minutah in {seconds} sekundah";
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