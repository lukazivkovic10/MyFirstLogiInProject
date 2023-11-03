using AngularAuthAPI.Context;
using AngularAuthAPI.Dtos;
using AngularAuthAPI.Models;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace AngularAuthAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReminderController
    {
        private readonly AppDbContext _config;
        private readonly ILogger<FileUploadController> _logger;

        public ReminderController(AppDbContext configuration, ILogger<FileUploadController> logger)
        {
            _config = configuration;
            _logger = logger;
        }

        [Authorize]
        [HttpPost("UstvariReminder")]
        public async Task<ActionResult<Response<object>>> CreateReminder([FromBody] ReminderDto reminderDto)
        {
            using var connection = new NpgsqlConnection(_config.Database.GetDbConnection().ConnectionString);

            _logger.LogInformation($"UstvariReminder");

            var exists = connection.ExecuteScalar<bool>("SELECT COUNT(1) FROM \"Reminder\" WHERE \"ItemName\" = @ItemName AND \"Tag\" = @Tag", new { reminderDto.ItemName, reminderDto.Tag });

            if(exists) 
            {

                _logger.LogInformation($"Error 400 ");
                // Error 400
                var errorResponse = new Response<object>
                {
                    Success = false,
                    Error = 400,
                    Message = "Ime že obstaja",
                    Data = "400"
                };

                return errorResponse;
            }
            else
            {
                var reminderDate = reminderDto.completeDate.AddHours(-24);

                var ReminderDescription = "Opravilo " + reminderDto.ItemName + " bo poteklo čez 24ur.";


                var query = "INSERT INTO \"Reminder\" (\"Tag\", \"ItemName\", \"completeDate\", \"ReminderDate\", \"ReminderSent\") VALUES (@Tag, @ItemName, @completeDate, @ReminderDate, 0)";

                await connection.ExecuteAsync(query, new
                {
                    Tag = reminderDto.Tag,
                    ItemName = reminderDto.ItemName,
                    completeDate = reminderDto.completeDate,
                    ReminderDate = reminderDate
                });

                _logger.LogInformation($"Uspešno nastavljen reminder.");

                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Uspešno nastavljen reminder."
                };

                return successResponse;
            }
        }
    }
}
