using AngularAuthAPI.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace AngularAuthAPI.Extensions
{
    public static class ApplicationServiceExtensions
    {
        public static IServiceCollection AppApplicationServices(this IServiceCollection services, IConfiguration config)
        {

            services.AddDbContext<AppDbContext>(options =>
            {
                // Use connection string provided at runtime by Heroku.
                var connUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

                if (!string.IsNullOrEmpty(connUrl))
                {
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

                    var connStr = $"Server={pgHost};Port={pgPort};User Id={pgUser};Password={pgPass};Database={pgDb};SSL Mode=Require;TrustServerCertificate=True";
                    options.UseNpgsql(connStr);
                }
                else
                {
                    options.UseNpgsql(config.GetConnectionString("DefaultConnection"));
                }
            });

            return services;
        }
    }
}
