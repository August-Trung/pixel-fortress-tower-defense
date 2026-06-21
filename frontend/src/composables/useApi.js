import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

export function useApi() {
  async function createPlayer(name) {
    const response = await api.post('/players', { name });
    return response.data;
  }

  async function submitScore(data) {
    // data matches SubmitScoreRequest: { playerId, score, wavesCompleted, enemiesKilled, totalGoldEarned, remainingHP, timePlayed }
    const response = await api.post('/scores', data);
    return response.data;
  }

  async function getRanking(limit = 20) {
    const response = await api.get(`/scores/ranking`, { params: { limit } });
    return response.data;
  }

  async function getPlayerScores(playerId) {
    const response = await api.get(`/scores/player/${playerId}`);
    return response.data;
  }

  return {
    createPlayer,
    submitScore,
    getRanking,
    getPlayerScores
  };
}
