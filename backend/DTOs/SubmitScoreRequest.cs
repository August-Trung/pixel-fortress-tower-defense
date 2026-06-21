using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class SubmitScoreRequest
    {
        [Required]
        public int PlayerId { get; set; }
        
        [Required]
        public int Score { get; set; }
        
        [Required]
        public int WavesCompleted { get; set; }
        
        [Required]
        public int EnemiesKilled { get; set; }
        
        [Required]
        public int TotalGoldEarned { get; set; }
        
        [Required]
        public int RemainingHP { get; set; }
        
        [Required]
        public int TimePlayed { get; set; }
    }
}
