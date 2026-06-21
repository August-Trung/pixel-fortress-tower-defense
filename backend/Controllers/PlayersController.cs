using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using backend.DTOs;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlayersController : ControllerBase
    {
        private readonly IPlayerService _playerService;

        public PlayersController(IPlayerService playerService)
        {
            _playerService = playerService;
        }

        [HttpPost]
        public async Task<IActionResult> GetOrCreatePlayer([FromBody] CreatePlayerRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { error = "Name is required and must be 1-50 characters." });
            }

            if (request.Name.Length > 50)
            {
                return BadRequest(new { error = "Name is required and must be 1-50 characters." });
            }

            var player = await _playerService.GetOrCreatePlayerAsync(request.Name);
            return Ok(player);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPlayer(int id)
        {
            var player = await _playerService.GetPlayerByIdAsync(id);
            if (player == null)
            {
                return NotFound(new { error = "Player not found." });
            }

            return Ok(player);
        }
    }
}
