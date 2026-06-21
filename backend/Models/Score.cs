using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Score
    {
        public int Id { get; set; }
        public int PlayerId { get; set; }
        
        [Column("Score")]
        public int ScoreValue { get; set; }
        
        public int WavesCompleted { get; set; }
        public int EnemiesKilled { get; set; }
        public int TotalGoldEarned { get; set; }
        public int RemainingHP { get; set; }
        public int TimePlayed { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Player Player { get; set; } = null!;
    }
}
