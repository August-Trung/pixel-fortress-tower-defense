using System;
using System.Collections.Generic;

namespace backend.Models
{
    public class Player
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<Score> Scores { get; set; } = new List<Score>();
    }
}
