using System;

namespace backend.DTOs
{
    public class RankingResponse
    {
        public int Rank { get; set; }
        public int PlayerId { get; set; }
        public string PlayerName { get; set; } = string.Empty;
        public int Score { get; set; }
        public int WavesCompleted { get; set; }
        public int EnemiesKilled { get; set; }
        public int TotalGoldEarned { get; set; }
        public int RemainingHP { get; set; }
        public int TimePlayed { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
