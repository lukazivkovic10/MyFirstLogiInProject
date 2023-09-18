namespace AngularAuthAPI.Models
{
    public class Reactivation
    {
        public int Tag { get; set; }
        public string ItemName { get; set; }
        public DateTime ReactivationDate { get; set; }
        public DateTime ReactivationExpiryDate { get; set; }
        public string ItemRepeating { get; set; }
    }
}
