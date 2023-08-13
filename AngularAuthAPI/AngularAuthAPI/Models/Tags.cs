using System.ComponentModel.DataAnnotations;

namespace AngularAuthAPI.Models
{
    public class Tags
    {
        [Key]
        public int TagId { get; set; }
        public string TagName { get; set; }
    }
}
