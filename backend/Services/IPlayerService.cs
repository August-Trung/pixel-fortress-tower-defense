using System.Threading.Tasks;
using backend.DTOs;

namespace backend.Services
{
    public interface IPlayerService
    {
        Task<PlayerDto> GetOrCreatePlayerAsync(string name);
        Task<PlayerDto?> GetPlayerByIdAsync(int id);
    }
}
