using AngularAuthAPI.HubConfig;
using AngularAuthAPI.Models;
using Dapper;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Data.Common;
using System.Text.RegularExpressions;

namespace AngularAuthAPI.Services
{
    public class ReactivationService
    {
        private readonly ILogger<ReactivationService> _logger;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly string _connectionString;

        public ReactivationService(string connectionString, IHubContext<NotificationHub> hubContext, ILogger<ReactivationService> logger)
        {
            _connectionString = connectionString;
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task ScheduleReactivationChecks()
        {
            using (IDbConnection dbConnection = new SqlConnection(_connectionString))
            {
                dbConnection.Open();

                var todoItems = dbConnection.Query<Items>("SELECT * FROM Items WHERE ItemRepeating IS NOT NULL").ToList();

                foreach (var item in todoItems)
                {
                    CalculateNextActivationDate(item);

                    var itemsNextDate = dbConnection.Query<RepeatingItem>("SELECT NextActivationDate FROM RepeatingItem WHERE ItemName = @ItemName and Tag = @Tag", new { ItemName = item.ItemName, Tag = item.Tag });

                    foreach (var repeatingItem in itemsNextDate)
                    {
                        if (repeatingItem.NextActivationDate <= DateTime.Today)
                        {
                            PerformReactivation(item);
                        }
                    }
                }
            }
        }

        private DateTime CalculateNextActivationDate(Items todoItem)
        {
            DateTime nextActivationDate = todoItem.CreatedDate;

            switch (todoItem.ItemRepeating)
            {
                case "Dnevno":
                    // For daily reactivation, set the next activation date to one day from now
                    nextActivationDate = nextActivationDate.AddDays(1);
                    break;
                case "Tedensko":
                    // For weekly reactivation, get the selected days of the week as an array of numbers
                    int[] selectedDays = todoItem.ItemDaysOfWeek
                        .Split(',')
                        .Select(int.Parse)
                        .ToArray();

                    // Calculate the next reactivation date based on the selected days
                    nextActivationDate = GetNextReactivationDate(nextActivationDate, selectedDays);
                    break;
                case "Mesecno":
                    // For monthly reactivation, set the next activation date to one month from now
                    nextActivationDate = nextActivationDate.AddMonths(1);
                    break;
                case "Letno":
                    // For yearly reactivation, set the next activation date to one year from now
                    nextActivationDate = nextActivationDate.AddYears(1);
                    break;
                case "custom":
                    // Implement custom logic to calculate the next activation date
                    break;
                default:
                    _logger.LogError($"Unknown reactivation type: {todoItem.ItemRepeating}");
                    // Handle invalid or unknown reactivation type
                    break;
            }

            using (IDbConnection dbConnection = new SqlConnection(_connectionString))
            {
                dbConnection.Open();
                dbConnection.Execute(
                    "UPDATE RepeatingItem SET NextActivationDate = @NextActivationDate WHERE Tag = @Tag AND ItemName = @ItemName",
                    new
                    {
                       ItemName = todoItem.ItemName,
                       Tag = todoItem.Tag,
                       NextActivationDate = nextActivationDate
                    });
            }

            return nextActivationDate;
        }

        private void CalculateReactivationDates(Items todoItem, string itemRepeating)
        {
            switch (itemRepeating)
            {
                case "Dnevno":
                    todoItem.CreatedDate = todoItem.NextActivationDate.AddDays(1);
                    todoItem.CompleteDate = todoItem.NextActivationDate.AddDays(1 * 2);
                    break;
                case "Tedensko":
                    // Implement logic for weekly reactivation
                    // Get the selected days of the week as an array of numbers
                    int[] selectedDays = todoItem.ItemDaysOfWeek
                        .Split(',')
                        .Select(int.Parse)
                        .ToArray();

                    // Calculate the next reactivation date based on the selected days
                    var nextReactivationDate = GetNextReactivationDate(todoItem.NextActivationDate, selectedDays);

                    // Set the ReactivationDate and ExpiryDate accordingly
                    todoItem.CreatedDate = nextReactivationDate;
                    todoItem.CompleteDate = nextReactivationDate.AddDays(1); // Example: Expires in 1 day
                    break;

                case "Mesecno":
                    todoItem.CreatedDate = todoItem.NextActivationDate.AddDays(31);
                    todoItem.CompleteDate = todoItem.NextActivationDate.AddDays(31 * 2);
                    break;
                case "Letno":
                    todoItem.CreatedDate = todoItem.NextActivationDate.AddDays(365);
                    todoItem.CompleteDate = todoItem.NextActivationDate.AddDays(365 * 2);
                    break;
                case "custom":
                    // Set the CreatedDate to a custom date (e.g., 30 days from the CompleteDate)
                    break;
                default:
                    _logger.LogError($"Unknown reactivation type: {itemRepeating}");
                    // Handle invalid or unknown reactivation type
                    break;
            }
        }

        private DateTime GetNextReactivationDate(DateTime completeDate, int[] selectedDays)
        {
            DateTime nextDate = completeDate.AddDays(1); // Start with the day after CompleteDate

            // Keep looping until we find the next selected day
            while (!selectedDays.Contains((int)nextDate.DayOfWeek))
            {
                nextDate = nextDate.AddDays(1);
            }

            return nextDate;
        }

        private void PerformReactivation(Items todoItem)
        {
            using (IDbConnection dbConnection = new SqlConnection(_connectionString))
            {
                dbConnection.Open();

                // Implement actions to be taken when an item is reactivated
                // For example, you can create a new version of the item, update database records, notify clients, etc.

                // Calculate the next activation date for the item
                CalculateReactivationDates(todoItem, todoItem.ItemRepeating);

                // Update the database with the new item or reactivation information
                dbConnection.Execute(
                    "UPDATE Items SET CreatedDate = @CreatedDate, CompleteDate = @CompleteDate WHERE Id = @Id",
                    new
                    {
                        todoItem.CreatedDate,
                        todoItem.CompleteDate,
                        Id = todoItem.Id
                    });

                // Notify clients through SignalR (NotificationHub)
                _hubContext.Clients.All.SendAsync("ReactivationPerformed", todoItem.Id);
            }
        }
    }
    }
