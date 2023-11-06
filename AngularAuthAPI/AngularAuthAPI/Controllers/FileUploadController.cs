using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Net.Http.Headers;
using Dapper;
using AngularAuthAPI.Models;
using System.Net.Mime;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.AspNetCore.Authorization;
using Npgsql;
using AngularAuthAPI.Context;
using Microsoft.EntityFrameworkCore;

namespace AngularAuthAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FileUploadController : ControllerBase
    {
        private readonly AppDbContext _config;
        private readonly ILogger<FileUploadController> _logger;

        public FileUploadController(AppDbContext configuration, ILogger<FileUploadController> logger)
        {
            _config = configuration;
            _logger = logger;
        }

        private readonly string[] AllowedFileExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".mp4", ".txt", ".pdf", ".zip", ".7zip", ".pptx", ".pptm", ".ppt", ".xlsx", ".xlsm", ".xlsb", ".xltx", ".doc", ".plain", ".mpeg", ".mp3" };
        private const long MaxFileSize = 25 * 1024 * 1024;

        [HttpPost("Upload")]
        public IActionResult Upload([FromForm] string todoTagName, [FromForm] string Tag, [FromForm] string ItemName, [FromForm] List<IFormFile> files)
        {
            try
            {
                var fileCount = files.Count;
                _logger.LogInformation($"Number of files received: {fileCount}");

                foreach (var file in files)
                {
                    if (file.Length > 0)
                    {
                        var fileName = ContentDispositionHeaderValue.Parse(file.ContentDisposition).FileName.Trim('"');
                        _logger.LogInformation($"fileName: {fileName}");

                        var fileExtension = Path.GetExtension(fileName).ToLowerInvariant();
                        _logger.LogInformation($"fileExtension: {fileExtension}");

                        // Check if the file extension is allowed
                        if (!AllowedFileExtensions.Contains(fileExtension))
                        {
                            return BadRequest(new { message = "Ta tip datoteke(npr.'.exe','.json') ni podpiran." });
                        }

                        // Check if the file size is within the limit
                        if (file.Length > MaxFileSize)
                        {
                            return BadRequest(new { message = "Velikost datoteke presega 25MB." });
                        }

                        // Create a unique folder for each to-do item
                        var todoFolderPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "todo_" + todoTagName.ToString());

                        // Ensure the directory exists, or create it if it doesn't
                        Directory.CreateDirectory(todoFolderPath);

                        var filePath = Path.Combine(todoFolderPath, fileName);

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            file.CopyTo(stream);
                        }

                        // Insert file information into the database using Dapper
                        using (var connection = new NpgsqlConnection(_config.Database.GetDbConnection().ConnectionString))
                        {
                            connection.Open();

                            var fileUpload = new FileUpload
                            {
                                FileName = fileName,
                                FilePath = filePath,
                                FileSize = file.Length,
                                ItemName = ItemName.ToString(),
                                Tag = Tag.ToString()
                            };

                            var sql = "INSERT INTO \"FileUpload\" (\"FileName\", \"FilePath\", \"FileSize\", \"Tag\", \"ItemName\") VALUES (@FileName, @FilePath, @FileSize, @Tag, @ItemName);";
                            connection.Execute(sql, fileUpload);

                        }

                        _logger.LogInformation("File processed successfully.");
                    }
                    else
                    {
                        return BadRequest(new { message = "Nobena izbrana datoteka." });
                    }
                }

                // Return the response after all files have been processed
                return Ok(new { message = "Files uploaded successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while uploading the file.", error = ex.Message });
            }
        }
        [Authorize]
        [HttpGet("GetAllFiles")]
        public async Task<ActionResult<Response<object>>> GetAllFiles()
        {
            using var connection = new NpgsqlConnection(_config.Database.GetDbConnection().ConnectionString);
            IEnumerable<FileUpload> files = await SelectAllFiles(connection);

             if (files == null)
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
                var data = await connection.QueryAsync<FileUpload>("select * from \"FileUpload\"");
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

        private static async Task<IEnumerable<FileUpload>> SelectAllFiles(NpgsqlConnection connection)
        {
            return await connection.QueryAsync<FileUpload>("select * from \"FileUpload\"");
        }
        [Authorize]
        [HttpGet("DownloadFile/{id}")]
        public IActionResult DownloadFile(int id)
        {
            using (var connection = new NpgsqlConnection(_config.Database.GetDbConnection().ConnectionString))
            {
                connection.Open();

                // Retrieve the file information based on the ID
                var file = connection.QueryFirstOrDefault<FileUpload>("SELECT \"FileName\", \"FilePath\" FROM \"FileUpload\" WHERE \"Id\" = @Id", new { Id = id });

                if (file == null)
                {
                    return NotFound("File not found");
                }

                var filePath = file.FilePath;
                var fileName = file.FileName;

                if (System.IO.File.Exists(filePath))
                {
                    // Determine the file's MIME type based on its extension
                    var provider = new FileExtensionContentTypeProvider();
                    if (!provider.TryGetContentType(fileName, out var contentType))
                    {
                        contentType = "application/octet-stream"; // Default to binary data if MIME type is not found
                    }

                    // Set Content-Disposition header to make the file open by default
                    var contentDisposition = new ContentDispositionHeaderValue("inline")
                    {
                        FileName = fileName
                    };
                    Response.Headers.Add("Content-Disposition", contentDisposition.ToString());

                    // Serve the file to the client for download
                    var fileStream = System.IO.File.OpenRead(filePath);
                    return File(fileStream, contentType, fileName);
                }
                else
                {
                    return NotFound("File not found on the server");
                }
            }
        }
    }
}
