using AngularAuthAPI.HubConfig;
using AngularAuthAPI.Models;
using Dapper;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;

namespace AngularAuthAPI.Services
{
    public class ReminderService
    {
        private readonly ILogger<NotificationHub> _logger;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly string _connectionString;

        public ReminderService(IHubContext<NotificationHub> hubContext, string connectionString, ILogger<NotificationHub> logger)
        {
            _hubContext = hubContext;
            _connectionString = connectionString;
            _logger = logger;
        }

        public async Task CheckAndSendNotifications()
        {
            try
            {
                using (var connection = new SqlConnection(_connectionString))
                {
                    connection.Open();
                    var currentDate = DateTime.Now;

                    // Query due reminders using Dapper
                    var dueReminders = connection.Query<Reminder>(
                        "SELECT * FROM Reminder WHERE ReminderDate <= @CurrentDate AND ReminderSent = 0",
                        new { CurrentDate = currentDate })
                        .ToList();

                    _logger.LogInformation($"Found {dueReminders.Count} due reminders.");

                    foreach (var reminder in dueReminders)
                    {
                        // Check if the reminderDate matches currentDate
                        if (reminder.ReminderDate <= currentDate)
                        {
                            _logger.LogInformation($"Sending reminder for '{reminder.ItemName}'");
                            // Send the reminder using SignalR
                            await SendNotification($"Reminder for '{reminder.ItemName}': {reminder.ReminderDescription}");

                            // Mark the reminder as sent in the database
                            connection.Execute(
                                "UPDATE Reminder SET ReminderSent = 1 WHERE Id = @Id",
                                new { Id = reminder.Id });
                            _logger.LogInformation($"Reminder sent for '{reminder.ItemName}'");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // Handle exceptions as needed
                Console.WriteLine($"Error: {ex}");
                _logger.LogError($"Error: {ex}");
            }
        }

        public async Task SendNotification(string message)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", message);
        }
    }
}
