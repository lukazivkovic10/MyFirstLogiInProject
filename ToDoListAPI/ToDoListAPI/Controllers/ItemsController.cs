using Dapper;
using Microsoft.AspNetCore.Connections.Features;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Immutable;
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

        [HttpGet("ItemsList")]
        public async Task<ActionResult<List<Items>>> GetAllItems()
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select * from Items");
            ////Preveri
            if (exists == false)
            {
                //Error 404
                return Ok(await connection.QueryAsync<Errors>("select * from Errors where ErrorCode = 404"));
            }
            else
            {
                //Uspesno
                IEnumerable<Items> items = await SelectAllItems(connection);
                return Ok(items);
            }
        }

        [HttpGet("IskanjeLista{ItemTag}")]
        public async Task<ActionResult<List<Items>>> GetItems(string ItemTag)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select count(1) from Items where Tag = @ItemTag", new { ItemTag });
            ////Preveri
            if (exists == true)
            {
                //Uspešno
                var item = await connection.QueryAsync<Items>("select * from Items where Tag = @Tag",
                new { Tag = ItemTag });
                return Ok(item);
            }
            //Error 204
            return Ok(await connection.QueryAsync<Errors>("select * from Errors where ErrorCode = 204"));
        }

        [HttpPost("Ustvarjanje")]
        public async Task<ActionResult<List<Items>>> CreateItem(Items items)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select count(1) from Items where ItemName = @ItemName and Tag = @Tag", new { items.ItemName, items.Tag });
            ////Preveri
            if (exists == true)
            {
                //Error 400
                return BadRequest(await connection.QueryAsync<Errors>("select * from Errors where ErrorCode = 400"));
            }
            //Uspešno
            var item = await connection.ExecuteAsync("if not exists (select * from items where ItemName = @ItemName and Tag = @Tag) insert into Items (Tag, ItemName, ItemDesc) values (@Tag, @ItemName, @ItemDesc)", items);
            await connection.ExecuteAsync("update Items set Active = '1', ItemStatus = '1'", items);
            return Ok(item);
        }

        [HttpPut("Update")]

        public async Task<ActionResult<List<Items>>> UpdateItem(Items items)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select count(1) from Items where ItemName = @ItemName and Tag = @Tag", new { items.ItemName, items.Tag });
            ////Preveri
            if (exists == false)
            {
                //Error 204
                return Ok(await connection.QueryAsync<Errors>("select * from Errors where ErrorCode = 204"));
            }
            await connection.ExecuteAsync("update Items set ItemName = @ItemName, ItemDesc = @ItemDesc where Tag = @Tag and ItemName = @ItemName", items);
            return Ok(await SelectAllItems(connection));
        }

        [HttpPut("Opravljeno")]

        public async Task<ActionResult<List<Items>>> DoneItem(Items items)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select count(1) from Items where ItemName = @ItemName and Tag = @Tag", new { items.ItemName, items.Tag});
            ////Preveri
            if (exists == false)
            {
                //Error 204
                return Ok(await connection.QueryAsync<Errors>("select * from Errors where ErrorCode = 204"));
            }
            await connection.ExecuteAsync("update Items set Active = '0' where ItemName = @ItemName and Tag = @Tag", items);
            return Ok(await SelectAllItems(connection));
        }

        [HttpPut("NiOpravljeno")]

        public async Task<ActionResult<List<Items>>> NotDoneItem(Items items)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select count(1) from Items where ItemName = @ItemName and Tag = @Tag", new { items.ItemName, items.Tag });
            ////Preveri
            if (exists == false)
            {
                //Error 204
                return Ok(await connection.QueryAsync<Errors>("select * from Errors where ErrorCode = 204"));
            }
            await connection.ExecuteAsync("update Items set Active = '1' where ItemName = @ItemName and Tag = @Tag", items);
            return Ok(await SelectAllItems(connection));
        }

        [HttpDelete("SoftDelete{ItemName}")]

        public async Task<ActionResult<List<Items>>> SoftDeleteItem(string ItemName)
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select count(1) from Items where ItemName = @ItemName", new { ItemName });
            ////Preveri
            if (exists == true)
            {
                await connection.ExecuteAsync("update Items set ItemStatus = '0' where ItemName = @ItemName",
                new { ItemName = ItemName });
                return Ok(await SelectAllItems(connection));
            }
            //Error 204
            return Ok(await connection.QueryAsync<Errors>("select * from Errors where ErrorCode = 204"));
        }

        [HttpGet("PrikazOpravljenih")]
        public async Task<ActionResult<List<Items>>> GetAllDoneItems()
        {
            using var connection = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
            var exists = connection.ExecuteScalar<bool>("select * from Items where Active = '0' and ItemStatus = '1'");
            ////Preveri
            if (exists == false)
            {
                //Error 404
                return Ok(await connection.QueryAsync<Errors>("select * from Errors where ErrorCode = 404"));
            }
            var item = await connection.QueryAsync<Items>("select * from Items where Active = '0' and ItemStatus = '1'");
            return Ok(item);
        }

        private static async Task<IEnumerable<Items>> SelectAllItems(SqlConnection connection)
        {
            return await connection.QueryAsync<Items>("select * from Items order by Tag");
        }
    }
}
