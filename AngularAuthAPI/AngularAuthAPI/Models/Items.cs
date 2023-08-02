using System.ComponentModel.DataAnnotations;

namespace AngularAuthAPI.Models
{
    public class Items
    {
        [Key]
        public int Id { get; set; }
        public string Tag { get; set; }
        public string ItemName { get; set; }
        public string ItemDesc { get; set; }
        public int ItemStatus { get; set; } = 1;
        public int Active { get; set; } = 1;
    }
}
