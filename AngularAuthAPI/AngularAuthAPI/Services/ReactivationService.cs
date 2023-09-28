using AngularAuthAPI.HubConfig;
using AngularAuthAPI.Models;
using Dapper;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;
using System.Data;
using Microsoft.Extensions.Logging;
using System.Data.Common;
using System.Data.SqlTypes;
using System.Text.RegularExpressions;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

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

                var todoItems = dbConnection.Query<dynamic>(
                    "SELECT r.*, i.completeDate, i.DateOfCompletion, i.CreatedDate " +
                    "FROM RepeatingItem r " +
                    "INNER JOIN Items i ON r.Tag = i.Tag AND r.ItemName = i.ItemName " +
                    "WHERE r.TypeOfReapeating IS NOT NULL;").ToList();

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

        private DateTime CalculateNextActivationDate(dynamic todoItem)
        {
            DateTime nextActivationDate = todoItem.CreatedDate;

            switch (todoItem.TypeOfReapeating)
            {
                case "Dnevno":
                    // For daily reactivation, set the next activation date to one day from now
                    if(nextActivationDate < SqlDateTime.MinValue.Value || nextActivationDate < SqlDateTime.MaxValue.Value)
                    {
                        nextActivationDate = todoItem.CreatedDate.AddDays(1);
                    }
                    else
                    nextActivationDate = nextActivationDate.AddDays(1);
                    break;
                case "Tedensko":
                    if (nextActivationDate < SqlDateTime.MinValue.Value || nextActivationDate < SqlDateTime.MaxValue.Value)
                    {
                        nextActivationDate = todoItem.CreatedDate;
                    }
                    else
                    {
                        // For weekly reactivation, get the selected days of the week as an array of numbers
                        int[] selectedDays = ((string)todoItem.ItemDaysOfWeek)
                        .Split(',')
                        .Select(int.Parse)
                        .ToArray();

                        // Calculate the next reactivation date based on the selected days
                        nextActivationDate = GetNextReactivationDate(nextActivationDate, selectedDays);
                    }
                    break;
                case "Mesecno":
                    // For monthly reactivation, set the next activation date to one month from now
                    if (nextActivationDate < SqlDateTime.MinValue.Value || nextActivationDate < SqlDateTime.MaxValue.Value)
                    {
                        nextActivationDate = todoItem.CreatedDate.AddMonths(1);
                    }
                    else
                        nextActivationDate = nextActivationDate.AddMonths(1);
                    break;
                case "Letno":
                    // For yearly reactivation, set the next activation date to one year from now
                    if (nextActivationDate < SqlDateTime.MinValue.Value || nextActivationDate < SqlDateTime.MaxValue.Value)
                    {
                        nextActivationDate = todoItem.CreatedDate.AddYears(1);
                    }
                    else
                        nextActivationDate = nextActivationDate.AddYears(1);
                    break;
                case "custom":
                    // Implement custom logic to calculate the next activation date
                    break;
                default:
                    _logger.LogError($"Unknown reactivation type: {todoItem.TypeOfReapeating}");
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

        private void CalculateReactivationDates(dynamic todoItem, string TypeOfReapeating)
        {

            switch (TypeOfReapeating)
            {
                case "Dnevno":
                     todoItem.CreatedDate = todoItem.NextActivationDate.AddDays(1);
                     todoItem.CompleteDate = todoItem.NextActivationDate.AddDays(1 * 2);
                    break;
                case "Tedensko":
                    // Implement logic for weekly reactivation
                    // Get the selected days of the week as an array of numbers
                    int[] selectedDays = ((string)todoItem.ItemDaysOfWeek)
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
                    _logger.LogError($"Unknown reactivation type: {TypeOfReapeating}");
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

        private void PerformReactivation(dynamic todoItem)
        {
            using (IDbConnection dbConnection = new SqlConnection(_connectionString))
            {
                dbConnection.Open();

                // Implement actions to be taken when an item is reactivated
                // For example, you can create a new version of the item, update database records, notify clients, etc.

                // Calculate the next activation date for the item
                CalculateReactivationDates(todoItem, todoItem.TypeOfReapeating);

                // Update the database with the new item or reactivation information
                dbConnection.Execute(
                "UPDATE Items SET CreatedDate = @CreatedDate, CompleteDate = @CompleteDate WHERE ItemName = @ItemName AND Tag = @Tag",
                    new
                    {
                        CreatedDate = todoItem.CreatedDate,
                        CompleteDate = todoItem.CompleteDate,
                        ItemName = todoItem.ItemName,
                        Tag = todoItem.Tag
                    });

                // Notify clients through SignalR (NotificationHub)
                _hubContext.Clients.All.SendAsync("ReactivationPerformed");
            }
        }
    }
    }
