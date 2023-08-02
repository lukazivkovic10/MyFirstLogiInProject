﻿namespace AngularAuthAPI.Models
{
    public class Response<T>
    {
        public bool Success { get; set; }
        public int Error { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }
    }
}
