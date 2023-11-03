using AngularAuthAPI.Context;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.Extensions.FileProviders;
using AngularAuthAPI.HubConfig;
using AngularAuthAPI.Services;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Configuration;
using AngularAuthAPI.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddLogging();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AppApplicationServices(builder.Configuration);

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("veryverysceret.....")),
        ValidateAudience = false,
        ValidateIssuer = false
    };
});

builder.Services.AddScoped<ReactivationService>(provider =>
{
    var configuration = provider.GetRequiredService<IConfiguration>();
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    var hubContext = provider.GetRequiredService<IHubContext<NotificationHub>>();
    var logger = provider.GetRequiredService<ILogger<ReactivationService>>();
    return new ReactivationService(connectionString, hubContext, logger);
});

builder.Services.AddScoped<ReminderService>(provider =>
{
    var configuration = provider.GetRequiredService<IConfiguration>();
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    var hubContext = provider.GetRequiredService<IHubContext<NotificationHub>>();
    var logger = provider.GetRequiredService<ILogger<NotificationHub>>();
    return new ReminderService(hubContext, connectionString, logger);
});

builder.Services.AddHostedService<ReminderWorker>();


builder.Services.AddSignalR();

var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
   app.UseSwagger();
   app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(builder => builder
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()
    .WithOrigins("https://localhost:4200"));

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.UseDefaultFiles();
app.UseStaticFiles();
var fileProvider = new PhysicalFileProvider(Directory.GetCurrentDirectory());
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = fileProvider
});

app.MapControllers();
app.MapFallbackToController("Index", "Fallback");

app.UseEndpoints(endpoints =>
{
    endpoints.MapHub<NotificationHub>("/notificationHub"); // Map the SignalR hub
    endpoints.MapControllers();
});

app.Run();

public class ReminderWorker : BackgroundService
{
    private readonly ILogger<ReminderWorker> _logger;
    private readonly IServiceProvider _services;
    private readonly IHostApplicationLifetime _hostApplicationLifetime;

    public ReminderWorker(IServiceProvider services, IHostApplicationLifetime hostApplicationLifetime, ILogger<ReminderWorker> logger)
    {
        _services = services;
        _hostApplicationLifetime = hostApplicationLifetime;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // Perform your notification checks and sending here using ReminderService
            using (var scope = _services.CreateScope())
            {
                try
                {
                    _logger.LogInformation("Worker executing...");

                    var ReactivationService = scope.ServiceProvider.GetRequiredService<ReactivationService>();
                    await ReactivationService.ScheduleReactivationChecks();

                    var reminderService = scope.ServiceProvider.GetRequiredService<ReminderService>();
                    await reminderService.CheckAndSendNotifications();
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error in ReminderWorker: {ex}");
                }
                _logger.LogInformation("---------------------------------------------------------------------------------------");
                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }
    }

    public override async Task StopAsync(CancellationToken stoppingToken)
    {
        // Clean up resources or perform any final tasks here
        _hostApplicationLifetime.StopApplication();
        await base.StopAsync(stoppingToken);
    }
}