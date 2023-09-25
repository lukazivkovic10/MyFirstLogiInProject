namespace AngularAuthAPI.Models
{
    public class RepeatingItem
    {
        public string ItemName { get; set; }
        public string Tag { get; set; }
        public string TypeOfReapeating { get; set; }
        public DateTime NextActivationDate { get; set; }
        public string ItemDaysOfWeek { get; set; }
    }
}
