using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using backend.DTOs;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ScoresController : ControllerBase
    {
        private readonly IScoreService _scoreService;

        public ScoresController(IScoreService scoreService)
        {
            _scoreService = scoreService;
        }

        [HttpPost]
        public async Task<IActionResult> SubmitScore([FromBody] SubmitScoreRequest request)
        {
            if (request == null || request.PlayerId <= 0 || request.Score < 0)
            {
                return BadRequest(new { error = "Invalid score submission data." });
            }

            var result = await _scoreService.SubmitScoreAsync(request);
            return StatusCode(201, result);
        }

        [HttpGet("ranking")]
        public async Task<IActionResult> GetRanking([FromQuery] int limit = 20)
        {
            if (limit <= 0) limit = 20;
            var rankings = await _scoreService.GetRankingAsync(limit);
            return Ok(rankings);
        }

        [HttpGet("player/{playerId}")]
        public async Task<IActionResult> GetPlayerScores(int playerId)
        {
            if (playerId <= 0)
            {
                return BadRequest(new { error = "Invalid Player ID." });
            }

            var scores = await _scoreService.GetPlayerScoresAsync(playerId);
            return Ok(scores);
        }
    }
}
