using AngularAuthAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using AngularAuthAPI.Dtos;
using Microsoft.Extensions.Logging;

namespace AngularAuthAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ListController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly ILogger<ListController> _logger;
        public ListController( IConfiguration configuration, ILogger<ListController> logger)
        {
            _config = configuration;
            _logger = logger;
        }

        [HttpGet("IskanjeListaVseh")]
        public async Task<ActionResult<Response<object>>> GetAllItems()
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            IEnumerable<Items> items = await SelectAllItems(connection);
            ////Preveri
            if (items == null)
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

                DateTime currentDate = DateTime.Now;
                List<Items> data = new List<Items>();

                foreach (var item in items)
                {
                    if (currentDate > item.CompleteDate)
                    {
                        PosodobiStatus(connection, item.Id, 2);
                    }
                    else if (currentDate < item.CompleteDate)
                    {
                        PosodobiStatus(connection, item.Id, 1);
                    }

                    data.Add(item);
                }
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

        [HttpGet("PrikazOpravljenih")]
        public async Task<ActionResult<Response<object>>> GetAllDoneItems()
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select * from Items where Active = '0' and ItemStatus = '1'");
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
                var data = await connection.QueryAsync<Items>("select * from Items where Active = '0' and ItemStatus = '1'");
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

        [HttpGet("IskanjeLista/{SearchedItem}")]
        public async Task<ActionResult<Response<object>>> GetItems(string SearchedItem)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var existsWithTag = connection.ExecuteScalar<bool>("select count(1) from Items where Tag = @SearchedItem", new { SearchedItem });

            if (existsWithTag)
            {
                var data = await connection.QueryAsync<Items>("select * from Items where Tag = @SearchedItem", new { SearchedItem });
                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Pridobljeni podatki.",
                    Data = data
                };

                return successResponse;
            }
            else
            {
                var existsWithItemName = connection.ExecuteScalar<bool>("select count(1) from Items where ItemName = @SearchedItem", new { SearchedItem });

                if (existsWithItemName)
                {
                    var data = await connection.QueryAsync<Items>("select * from Items where ItemName = @SearchedItem", new { SearchedItem });
                    var successResponse = new Response<object>
                    {
                        Success = true,
                        Error = 200,
                        Message = "Pridobljeni podatki.",
                        Data = data
                    };

                    return successResponse;
                }
                else
                {
                    //Error 404
                    var errorResponse = new Response<object>
                    {
                        Success = false,
                        Error = 404,
                        Message = "Podatki ne obstajajo",
                        Data = "404"
                    };

                    return errorResponse;
                }
            }
        }

        [HttpPut("Update")]
        public async Task<ActionResult<Response<object>>> UpdateItem([FromBody] ListItemDto ItemDto)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select count(1) from Items where ItemName = @ItemName and Tag = @Tag", new { ItemDto.ItemName, ItemDto.Tag });
            ////Preveri
            if (exists == false)
            {
                var erorrResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Bad Request - Iskano ne obstaja",
                    Data = "404"
                };

                return erorrResponse;
            }
            else
            {
                await connection.ExecuteAsync("update Items set ItemName = @ItemName, ItemDesc = @ItemDesc where Tag = @Tag and ItemName = @ItemName", ItemDto);
                IEnumerable<Items> data = await SelectAllItems(connection);
                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "200 Success - Pridobljeni podatki.",
                    Data = data
                };

                return successResponse;
            }
        }

        [HttpPut("UpdateStatus")]
        public async Task<ActionResult<Response<object>>> UpdateStatus([FromBody] ListItemDto ItemDto)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));

            var exists = connection.ExecuteScalar<bool>("SELECT COUNT(1) FROM Items WHERE ItemName = @ItemName AND Tag = @Tag", new { ItemDto.ItemName, ItemDto.Tag });

            if (!exists)
            {
                var errorResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Bad Request - Item not found",
                    Data = "404"
                };

                return errorResponse;
            }
            else
            {
                var currentItem = connection.QuerySingleOrDefault<Items>("SELECT ItemDesc FROM Items WHERE ItemName = @ItemName AND Tag = @Tag", new { ItemDto.ItemName, ItemDto.Tag });
                ItemDto.ItemDesc = currentItem.ItemDesc;

                // Update the CompleteDate
                await connection.ExecuteAsync("UPDATE Items SET Active = @Active, ItemStatus = 1 WHERE Tag = @Tag AND ItemName = @ItemName", new { ItemDto.Active, ItemDto.Tag, ItemDto.ItemName });

                var data = await SelectAllItems(connection);

                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Success - Data retrieved.",
                    Data = data
                };

                return successResponse;
            }
        }

        [HttpPut("UpdateDate")]
        public async Task<ActionResult<Response<object>>> UpdateDate([FromBody] ListItemDto ItemDto)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));

            var exists = connection.ExecuteScalar<bool>("SELECT COUNT(1) FROM Items WHERE ItemName = @ItemName AND Tag = @Tag", new { ItemDto.ItemName, ItemDto.Tag });

            if (!exists)
            {
                var errorResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Bad Request - Item not found",
                    Data = "404"
                };

                return errorResponse;
            }
            else
            {
                var currentItem = connection.QuerySingleOrDefault<Items>("SELECT ItemDesc FROM Items WHERE ItemName = @ItemName AND Tag = @Tag", new { ItemDto.ItemName, ItemDto.Tag });
                ItemDto.ItemDesc = currentItem.ItemDesc;

                // Update the CompleteDate
                await connection.ExecuteAsync("UPDATE Items SET CompleteDate = @CompleteDate WHERE Tag = @Tag AND ItemName = @ItemName", new { ItemDto.CompleteDate, ItemDto.Tag, ItemDto.ItemName });

                var data = await SelectAllItems(connection);

                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Success - Data retrieved.",
                    Data = data
                };

                return successResponse;
            }
        }

        [HttpPut("Opravljeno")]
        public async Task<ActionResult<Response<object>>> DoneItem([FromBody] ListItemDataDto ItemDataDto)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = await connection.ExecuteScalarAsync<bool>("select count(1) from Items where ItemName = @ItemName and Tag = @Tag", new { ItemDataDto.ItemName, ItemDataDto.Tag });


            if (!exists)
            {
                // Error 404
                var errorResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Iskano ne obstaja",
                    Data = "404"
                };

                return errorResponse;
            }
            else
            {

                // Calculate and store TimeTakenSeconds
                var currentItem = await connection.QuerySingleOrDefaultAsync<Items>("select * from Items where ItemName = @ItemName and Tag = @Tag", new { ItemDataDto.ItemName, ItemDataDto.Tag });

                var TimeTakenSeconds = (int)(currentItem.DateOfCompletion - currentItem.CreatedDate).TotalSeconds;

                // Update the Active status, DateOfCompletion, and TimeTakenSeconds
                await connection.ExecuteAsync("update Items SET TimeTakenSeconds = @TimeTakenSeconds, Active = '0', DateOfCompletion = @CurrentDate where ItemName = @ItemName and Tag = @Tag",new { ItemDataDto.ItemName, ItemDataDto.Tag, CurrentDate = DateTime.Now, TimeTakenSeconds });

                _logger.LogInformation($"TimeTakenSeconds: " + TimeTakenSeconds);
                var Response = new Response<object>
                    {
                        Success = true,
                        Error = 200,
                        Message = "Pridobljeni podatki.",
                        Data = TimeTakenSeconds
                    };

                    return Response;
            }
        }

        [HttpPut("NiOpravljeno")]

        public async Task<ActionResult<Response<object>>> NotDoneItem([FromBody] ListItemDto ItemDto)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select count(1) from Items where ItemName = @ItemName and Tag = @Tag", new { ItemDto.ItemName, ItemDto.Tag });
            ////Preveri
            if (exists == false)
            {
                ///Error 404
                var erorrResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Iskano ne obstaja",
                    Data = "404"
                };

                return erorrResponse;
            }
            else
            {
                await connection.ExecuteAsync("update Items set Active = '1' where ItemName = @ItemName and Tag = @Tag", ItemDto);
                IEnumerable<Items> data = await SelectAllItems(connection);
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

        [HttpPost("Ustvarjanje")]
        public async Task<ActionResult<Response<object>>> CreateItem([FromBody] ListItemCreate ItemDto)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("SELECT COUNT(1) FROM Items WHERE ItemName = @ItemName AND Tag = @Tag", new { ItemDto.ItemName, ItemDto.Tag });

            if (exists)
            {
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
                // Generate the folder_path based on ItemName and Tag
                string folderPath = $"/uploads/todo_{ItemDto.Tag.Replace(" ", "_")}_{ItemDto.ItemName.Replace(" ", "_")}/";

                // Insert the new to-do item into the database with the generated folder_path
                await connection.ExecuteAsync("INSERT INTO Items (Tag, ItemName, ItemDesc, Active, ItemStatus, CreatedDate, CompleteDate, folderPath, ItemRepeating) " +
                                              "VALUES (@Tag, @ItemName, @ItemDesc, @Active, @ItemStatus, @CreatedDate, @CompleteDate, @folderPath, @ItemRepeating)",
                                              new
                                              {
                                                  ItemDto.Tag,
                                                  ItemDto.ItemName,
                                                  ItemDto.ItemDesc,
                                                  ItemDto.Active,
                                                  ItemDto.ItemStatus,
                                                  ItemDto.CreatedDate,
                                                  ItemDto.CompleteDate,
                                                  folderPath,
                                                  ItemDto.ItemRepeating
                                              });
                await connection.ExecuteAsync("INSERT INTO RepeatingItem (TypeOfReapeating, Tag, ItemName) " +
                                              "VALUES (@ItemRepeating, @Tag, @ItemNamE)",
                                              new
                                              {
                                                  ItemDto.Tag,
                                                  ItemDto.ItemName,
                                                  ItemDto.ItemRepeating
                                              });

                IEnumerable<Items> data = await SelectAllItems(connection);

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

        [HttpDelete("SoftDelete{ItemName}")]
        public async Task<ActionResult<Response<object>>> SoftDeleteItem(string ItemName)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select count(1) from Items where ItemName = @ItemName", new { ItemName });
            if (exists == true)
            {
                await connection.ExecuteAsync("update Items set ItemStatus = '0' where ItemName = @ItemName",
                new { ItemName = ItemName });
                IEnumerable<Items> data = await SelectAllItems(connection);
                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Pridobljeni podatki.",
                    Data = data
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

        private void PosodobiStatus(SqlConnection connection, int itemId, int itemStatus)
        {
            string query = "UPDATE Items SET ItemStatus = @itemStatus WHERE Id = @itemId AND ItemStatus <> 0";
            connection.Execute(query, new { itemStatus, itemId });
        }
        private static async Task<IEnumerable<Items>> SelectAllItems(SqlConnection connection)
        {
            return await connection.QueryAsync<Items>("select * from Items order by Tag");
        }

    }
}
