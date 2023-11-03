using AngularAuthAPI.Context;
using AngularAuthAPI.Controllers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace AngularAuthAPI.Extensions
{
    public static class ApplicationServiceExtensions
    {
        public static IServiceCollection AppApplicationServices(this IServiceCollection services, IConfiguration config, ILogger logger)
        {
            services.AddCors(option =>
            {
                option.AddPolicy("CorsPolicy", builder =>
                {
                    builder.WithOrigins("http://localhost:4200") // Add your Angular app's origin here
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials();
                });
            });

            services.AddDbContext<AppDbContext>(option =>
            {
                // Use connection string provided at runtime by Heroku.
                var connUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
                logger.LogInformation("DATABASE_URL");

                // Parse connection URL to connection string for Npgsql
                connUrl = connUrl.Replace("postgres://", string.Empty);
                var pgUserPass = connUrl.Split("@")[0];
                var pgHostPortDb = connUrl.Split("@")[1];
                var pgHostPort = pgHostPortDb.Split("/")[0];
                var pgDb = pgHostPortDb.Split("/")[1];
                var pgUser = pgUserPass.Split(":")[0];
                var pgPass = pgUserPass.Split(":")[1];
                var pgHost = pgHostPort.Split(":")[0];
                var pgPort = pgHostPort.Split(":")[1];

                logger.LogInformation(connUrl);

                var connStr = $"Server={pgHost};Port={pgPort};User Id={pgUser};Password={pgPass};Database={pgDb};SSL Mode=Require;TrustServerCertificate=True";
                option.UseNpgsql(connStr);
            });

            return services;
        }
    }
}
