using System.Collections.Generic;
using System.Threading.Tasks;
using backend.DTOs;

namespace backend.Services
{
    public interface IScoreService
    {
        Task<RankingResponse> SubmitScoreAsync(SubmitScoreRequest request);
        Task<List<RankingResponse>> GetRankingAsync(int limit);
        Task<List<RankingResponse>> GetPlayerScoresAsync(int playerId);
    }
}
