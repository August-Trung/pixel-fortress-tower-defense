import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useApi } from '../composables/useApi.js';
import { useGameStore } from './gameStore.js';

export const usePlayerStore = defineStore('player', () => {
  const player = ref(null);
  const rankings = ref([]);
  const loading = ref(false);
  const api = useApi();
  const gameStore = useGameStore();

  async function loginOrCreate(name) {
    loading.value = true;
    try {
      const res = await api.createPlayer(name);
      player.value = res;
      gameStore.playerName = res.name;
      gameStore.playerId = res.id;
      return res;
    } finally {
      loading.value = false;
    }
  }

  async function fetchRankings() {
    loading.value = true;
    try {
      const res = await api.getRanking(20);
      rankings.value = res;
      return res;
    } finally {
      loading.value = false;
    }
  }

  async function submitGameScore(scoreData) {
    loading.value = true;
    try {
      // payload matches SubmitScoreRequest
      const res = await api.submitScore({
        playerId: gameStore.playerId,
        score: scoreData.score,
        wavesCompleted: scoreData.wavesCompleted,
        enemiesKilled: scoreData.enemiesKilled,
        totalGoldEarned: scoreData.totalGoldEarned,
        remainingHP: scoreData.remainingHP,
        timePlayed: scoreData.timePlayed
      });
      return res;
    } finally {
      loading.value = false;
    }
  }

  return {
    player,
    rankings,
    loading,
    loginOrCreate,
    fetchRankings,
    submitGameScore
  };
});
