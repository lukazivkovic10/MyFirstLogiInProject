using AngularAuthAPI.Models;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace AngularAuthAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TagController : ControllerBase
    {
        private readonly IConfiguration _config;
        public TagController( IConfiguration configuration)
        {
            _config = configuration;
        }

        ///Tags 

        [HttpGet("VseTags")]

        public async Task<ActionResult<Response<object>>> GetAllTags()
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select * from Tags");
            ////Preveri
            if (exists == false)
            {
                //Error 404
                var erorrResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Podatki ne obstajajo",
                    Data = "404"
                };

                return erorrResponse;
            }
            else
            {
                //Uspesno
                var data = await connection.QueryAsync<Tags>("select * from Tags");
                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Pridobljeni podatki.",
                    Data = data
                };

                return successResponse;
            }
        }


        [HttpPost("UstvarjanjeTag")]
        public async Task<ActionResult<Response<object>>> CreateTag(Tags tags)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select count(1) from Tags where TagName = @TagName", new { tags.TagName });
            if (exists == true)
            {
                //Error 400
                var erorrResponse = new Response<object>
                {
                    Success = false,
                    Error = 400,
                    Message = "Ime že obstaja",
                    Data = "400"
                };

                return erorrResponse;
            }
            else
            {
                var item = await connection.ExecuteAsync("if not exists (select * from Tags where TagName = @TagName) insert into Tags (TagName) values (@TagName)", tags);
                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Oznaka narejena.",
                    Data = item
                };

                return successResponse;
            }
        }

        [HttpPut("IzbrisTag")]

        public async Task<ActionResult<Response<object>>> DeleteTag(Tags tags)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select count(1) from Tags where TagName = @TagName", new { tags.TagName });
            if (exists == true)
            {
                await connection.ExecuteAsync("Delete from Tags where TagName = @TagName and TagId = @TagId", tags);
                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Pridobljeni podatki.",
                    Data = null
                };

                return successResponse;
            }
            else
            {
                ///Error 404
                var erorrResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Ime ne obstaja",
                    Data = "404"
                };

                return erorrResponse;
            }
        }
    }
}
