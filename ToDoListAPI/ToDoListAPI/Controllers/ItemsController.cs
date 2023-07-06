using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Data.SqlClient;
using System.Reflection.Metadata.Ecma335;
using ToDoListAPI.Models;

namespace ToDoListAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ItemsController : ControllerBase
    {
        private readonly IConfiguration _config;

        public ItemsController(IConfiguration config)
        {
            _config = config;
        }

        [HttpGet("IskanjeVseh")]
        public async Task<ActionResult<List<Items>>> GetAllItems()
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            IEnumerable<Items> items = await SelectAllItems(connection);
            return Ok(items);
        }

        [HttpGet("IskanjeLista{ItemTag}")]
        public async Task<ActionResult<List<Items>>> GetItems(string ItemTag)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var item = await connection.QueryAsync<Items>("select * from Items where Tag = @Tag",
                new { Tag = ItemTag });
            return Ok(item);
        }

        [HttpPost("Ustvarjanje")]
        public async Task<ActionResult<List<Items>>> CreateItem(Items items)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var item = await connection.ExecuteAsync("insert into Items (Tag, ItemName, ItemDesc) values (@Tag, @ItemName, @ItemDesc)", items);
            return Ok(item);
        }

        [HttpPut("Posodobitev")]

        public async Task<ActionResult<List<Items>>> UpdateItem(Items items)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            await connection.ExecuteAsync("update Items set ItemName = @ItemName, ItemDesc = @ItemDesc where Tag = @Tag", items);
            return Ok(await SelectAllItems(connection));
        }

        [HttpDelete("Opravljeno")]

        public async Task<ActionResult<List<Items>>> DoneItem(string ItemName)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            await connection.ExecuteAsync("update Items set Active = '0' where ItemName = @ItemName",
                new { ItemName = ItemName });
            return Ok(await SelectAllItems(connection));
        }

        [HttpDelete("SoftDelete,{ItemName}")]

        public async Task<ActionResult<List<Items>>> SoftDeleteItem(string ItemName)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            await connection.ExecuteAsync("update Items set ItemStatus = '0' where ItemName = @ItemName",
                new { ItemName = ItemName });
            return Ok(await SelectAllItems(connection));
        }

        private static async Task<IEnumerable<Items>> SelectAllItems(SqlConnection connection)
        {
            return await connection.QueryAsync<Items>("select * from Items");
        }
    }
}
