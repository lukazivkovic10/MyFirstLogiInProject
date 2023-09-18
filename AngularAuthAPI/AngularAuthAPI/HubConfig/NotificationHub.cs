using AngularAuthAPI.Controllers;
using Microsoft.AspNetCore.SignalR;

namespace AngularAuthAPI.HubConfig
{
    public class NotificationHub : Hub
    {
        private readonly ILogger<NotificationHub> _logger;

        public NotificationHub(ILogger<NotificationHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation($"Client connected: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            _logger.LogInformation($"Client disconnected: {Context.ConnectionId}");
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendNotification(string message)
        {
            _logger.LogInformation($"Notification Sent" + message);
            // Broadcast the message to all connected clients
            await Clients.All.SendAsync("ReceiveNotification", message);
        }
    }
}
