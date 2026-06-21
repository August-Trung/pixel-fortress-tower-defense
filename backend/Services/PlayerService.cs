using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using backend.DTOs;

namespace backend.Services
{
    public class PlayerService : IPlayerService
    {
        private readonly AppDbContext _context;

        public PlayerService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PlayerDto> GetOrCreatePlayerAsync(string name)
        {
            var player = await _context.Players
                .FirstOrDefaultAsync(p => p.Name.ToLower() == name.Trim().ToLower());

            if (player == null)
            {
                player = new Player
                {
                    Name = name.Trim()
                };
                _context.Players.Add(player);
                await _context.SaveChangesAsync();
            }

            return new PlayerDto
            {
                Id = player.Id,
                Name = player.Name,
                CreatedAt = player.CreatedAt
            };
        }

        public async Task<PlayerDto?> GetPlayerByIdAsync(int id)
        {
            var player = await _context.Players.FindAsync(id);
            if (player == null) return null;

            return new PlayerDto
            {
                Id = player.Id,
                Name = player.Name,
                CreatedAt = player.CreatedAt
            };
        }
    }
}
