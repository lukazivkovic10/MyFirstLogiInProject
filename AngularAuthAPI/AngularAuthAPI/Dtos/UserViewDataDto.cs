namespace AngularAuthAPI.Dtos
{
    public class UserViewDataDto
    {
        public DateTime ViewedAt { get; set; }
        public int UserId { get; set; }
        public string Email { get; set; }
    }
}
