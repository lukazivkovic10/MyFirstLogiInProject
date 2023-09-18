namespace AngularAuthAPI.Models
{
    public class FileUpload
    {
        public int Id { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public long FileSize { get; set; }
        public string Tag { get; set; }
        public string ItemName { get; set; }
    }
}
