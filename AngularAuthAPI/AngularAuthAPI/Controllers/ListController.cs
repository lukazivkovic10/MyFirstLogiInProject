﻿using AngularAuthAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Dapper;
using AngularAuthAPI.Dtos;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;

namespace AngularAuthAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ListController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly ILogger<ListController> _logger;
        public ListController(IConfiguration configuration, ILogger<ListController> logger)
        {
            _config = configuration;
            _logger = logger;
        }

        [HttpGet("opravilo/{id}")]
        public async Task<ActionResult<Response<object>>> GetTodoById(int id)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select * from Items where id=@id", new {id});
            if(exists == true) 
            {
                //Uspesno
                var data = await connection.QueryAsync<Items>("select * from Items where id=@id", new { id });
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
                var erorrResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Opravilo tega Id ne obstaja.",
                    Data = "404"
                };

                return erorrResponse;
            };
        }

        [HttpGet("IskanjeListaVseh")]
        public async Task<ActionResult<Response<object>>> GetAllItems(int page = 1, int pageSize = 10)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));

            var items = await connection.QueryAsync<Items>(
                @"SELECT * FROM Items
                ORDER BY Tag
                OFFSET @Offset ROWS
                FETCH NEXT @PageSize ROWS ONLY",
                new { Offset = (page - 1) * pageSize, PageSize = pageSize });

            // Get total number of items
            var totalItems = await connection.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM Items");

            // Check if items exist
            if (items == null || !items.Any())
            {
                var errorResponse = new Response<object>
                {
                    Success = false,
                    Error = 404,
                    Message = "Podatki ne obstajajo",
                    Data = "404"
                };

                return errorResponse;
            }
            else
            {
                // Update item status
                DateTime currentDate = DateTime.Now;

                foreach (var item in items)
                {
                    if (currentDate > item.CompleteDate)
                    {
                        await connection.ExecuteAsync(
                            "UPDATE Items SET ItemStatus = @Status WHERE Id = @Id",
                            new { Status = 2, Id = item.Id });
                    }
                    else if (currentDate < item.CompleteDate)
                    {
                        await connection.ExecuteAsync(
                            "UPDATE Items SET ItemStatus = @Status WHERE Id = @Id",
                            new { Status = 1, Id = item.Id });
                    }
                }

                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "Pridobljeni podatki.",
                    Data = items.ToList()
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
                await connection.ExecuteAsync("update Items set ItemName = @ItemName, ItemDesc = @ItemDesc, CompleteDate = @CompleteDate, LastEditBy = @LastEditBy where Tag = @Tag and ItemName = @ItemName", ItemDto);
                var data = await connection.ExecuteAsync("Select * from items where Tag = @Tag and ItemName = @ItemName", ItemDto);
                var successResponse = new Response<object>
                {
                    Success = true,
                    Error = 200,
                    Message = "200 Success - Uspešno posodobljeno.",
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
                await connection.ExecuteAsync("update Items SET TimeTakenSeconds = @TimeTakenSeconds, Active = '0', DateOfCompletion = @CurrentDate, CompletedBy = @CompletedBy where ItemName = @ItemName and Tag = @Tag",new { ItemDataDto.ItemName, ItemDataDto.Tag, CurrentDate = DateTime.Now, TimeTakenSeconds, ItemDataDto.CompletedBy });

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

        public async Task<ActionResult<Response<object>>> NotDoneItem([FromBody] ListItemDataDto ItemDto)
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
                await connection.ExecuteAsync("INSERT INTO Items (Tag, ItemName, ItemDesc, Active, ItemStatus, CreatedDate, CompleteDate, folderPath, ItemRepeating, CreatedBy) " +
                                              "VALUES (@Tag, @ItemName, @ItemDesc, @Active, @ItemStatus, @CreatedDate, @CompleteDate, @folderPath, @ItemRepeating, @CreatedBy)",
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
                                                  ItemDto.ItemRepeating,
                                                  ItemDto.CreatedBy
                                              });
                _logger.LogInformation($"Inserts items" + ItemDto.CompleteDate);
                if(!string.IsNullOrEmpty(ItemDto.ItemRepeating))
                {
                    _logger.LogInformation($"ItemDto.ItemRepeating != null || ItemDto.ItemRepeating !=");
                    await connection.ExecuteAsync("INSERT INTO RepeatingItem (TypeOfReapeating, Tag, ItemName) VALUES (@ItemRepeating, @Tag, @ItemNamE)",
                                              new
                                              {
                                                  ItemDto.Tag,
                                                  ItemDto.ItemName,
                                                  ItemDto.ItemRepeating
                                              });
                }
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
