using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.DTOs;

namespace backend.Services
{
    public class ScoreService : IScoreService
    {
        private readonly AppDbContext _context;

        public ScoreService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<RankingResponse> SubmitScoreAsync(SubmitScoreRequest request)
        {
            var scoreEntity = new Score
            {
                PlayerId = request.PlayerId,
                ScoreValue = request.Score,
                WavesCompleted = request.WavesCompleted,
                EnemiesKilled = request.EnemiesKilled,
                TotalGoldEarned = request.TotalGoldEarned,
                RemainingHP = request.RemainingHP,
                TimePlayed = request.TimePlayed,
                CreatedAt = DateTime.UtcNow
            };

            _context.Scores.Add(scoreEntity);
            await _context.SaveChangesAsync();

            var player = await _context.Players.FindAsync(request.PlayerId);

            return new RankingResponse
            {
                Rank = 0,
                PlayerId = scoreEntity.PlayerId,
                PlayerName = player?.Name ?? "Unknown",
                Score = scoreEntity.ScoreValue,
                WavesCompleted = scoreEntity.WavesCompleted,
                EnemiesKilled = scoreEntity.EnemiesKilled,
                TotalGoldEarned = scoreEntity.TotalGoldEarned,
                RemainingHP = scoreEntity.RemainingHP,
                TimePlayed = scoreEntity.TimePlayed,
                CreatedAt = scoreEntity.CreatedAt
            };
        }

        public async Task<List<RankingResponse>> GetRankingAsync(int limit)
        {
            var topScores = await _context.Scores
                .Include(s => s.Player)
                .GroupBy(s => s.PlayerId)
                .Select(g => g.OrderByDescending(s => s.ScoreValue).First())
                .OrderByDescending(s => s.ScoreValue)
                .Take(limit)
                .ToListAsync();

            var result = new List<RankingResponse>();
            int rank = 1;
            foreach (var score in topScores)
            {
                result.Add(new RankingResponse
                {
                    Rank = rank++,
                    PlayerId = score.PlayerId,
                    PlayerName = score.Player?.Name ?? "Unknown",
                    Score = score.ScoreValue,
                    WavesCompleted = score.WavesCompleted,
                    EnemiesKilled = score.EnemiesKilled,
                    TotalGoldEarned = score.TotalGoldEarned,
                    RemainingHP = score.RemainingHP,
                    TimePlayed = score.TimePlayed,
                    CreatedAt = score.CreatedAt
                });
            }

            return result;
        }

        public async Task<List<RankingResponse>> GetPlayerScoresAsync(int playerId)
        {
            var scores = await _context.Scores
                .Include(s => s.Player)
                .Where(s => s.PlayerId == playerId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            var result = new List<RankingResponse>();
            foreach (var score in scores)
            {
                result.Add(new RankingResponse
                {
                    Rank = 0,
                    PlayerId = score.PlayerId,
                    PlayerName = score.Player?.Name ?? "Unknown",
                    Score = score.ScoreValue,
                    WavesCompleted = score.WavesCompleted,
                    EnemiesKilled = score.EnemiesKilled,
                    TotalGoldEarned = score.TotalGoldEarned,
                    RemainingHP = score.RemainingHP,
                    TimePlayed = score.TimePlayed,
                    CreatedAt = score.CreatedAt
                });
            }

            return result;
        }
    }
}
