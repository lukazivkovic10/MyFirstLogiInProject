using System.ComponentModel.DataAnnotations;

namespace ToDoListAPI.Models
{
    public class Errors
    {
        [Key]
        public int Id { get; set; }
        public int ErrorCode { get; set; }
        public string CodeName { get; set; }
        public string CodeDesc { get; set; }
    }
}
