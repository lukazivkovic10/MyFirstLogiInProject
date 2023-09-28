using System;
using System.ComponentModel.DataAnnotations;

namespace AngularAuthAPI.Models
{
    public class Reminder
    {
        [Key]
        public int Id { get; set; }
        public string Tag { get; set; }
        public string ItemName { get; set; }
        public DateTime completeDate { get; set; }
        public DateTime ReminderDate { get; set; }
        public bool ReminderSent { get; set; }
    }
}
