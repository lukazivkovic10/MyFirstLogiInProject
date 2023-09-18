using System.ComponentModel.DataAnnotations;

namespace AngularAuthAPI.Models
{
    public class Items
    {
        public int Id { get; set; }
        public string Tag { get; set; }
        public string ItemName { get; set; }
        public string ItemDesc { get; set; }
        public int ItemStatus { get; set; } = 1;
        public int Active { get; set; } = 1;
        public DateTime CreatedDate { get; set; }
        public DateTime CompleteDate { get; set; }
        public DateTime DateOfCompletion { get; set; }
        public int TimeTakenSeconds { get; set; }
        public string? TimeTaken { get; set; }
        public string FormattedCreatedDate { get; set; }
        public string FormattedDateOfCompletion { get; set; }
        public string FolderPath { get; set; }
        public string ItemRepeating { get; set; }
        public string ItemDaysOfWeek { get; set; }
        public DateTime NextActivationDate { get; set; }
    }
}
