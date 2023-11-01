namespace AngularAuthAPI.Dtos
{
    public class ListItemDataDto
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
        public string CompletedBy { get; set; }
    }
}
