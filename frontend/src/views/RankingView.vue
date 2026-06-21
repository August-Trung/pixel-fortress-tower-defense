<template>
  <div class="ranking-container d-flex align-center justify-center fill-height pa-4">
    <div class="pixel-card py-6 px-8 main-card font-game">
      <h1 class="text-center text-amber mb-6 title blink">LEADERBOARD</h1>
      
      <div v-if="playerStore.loading" class="text-center py-8 label text-grey">
        RETRIEVING RECORDS...
      </div>
      
      <div v-else-if="playerStore.rankings.length === 0" class="text-center py-8 label text-grey">
        NO RECORDS YET
      </div>
      
      <div v-else class="ranking-table-container mb-6">
        <table class="ranking-table">
          <thead>
            <tr>
              <th class="text-left header-cell">RANK</th>
              <th class="text-left header-cell">HERO</th>
              <th class="text-right header-cell">SCORE</th>
              <th class="text-right header-cell">WAVES</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="entry in playerStore.rankings" 
              :key="entry.playerId"
              :class="{ 'current-player': entry.playerName === gameStore.playerName }"
            >
              <td class="rank-col font-weight-bold">#{{ entry.rank }}</td>
              <td class="name-col text-white">{{ entry.playerName }}</td>
              <td class="score-col text-right text-amber">{{ entry.score }}</td>
              <td class="waves-col text-right text-blue">{{ entry.wavesCompleted }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="text-center">
        <button class="pixel-btn" @click="goHome">
          MAIN MENU
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '../stores/playerStore.js';
import { useGameStore } from '../stores/gameStore.js';

const router = useRouter();
const playerStore = usePlayerStore();
const gameStore = useGameStore();

onMounted(async () => {
  try {
    await playerStore.fetchRankings();
  } catch (err) {
    console.error('Failed to load leaderboard:', err);
  }
});

function goHome() {
  router.push('/');
}
</script>

<style scoped>
.ranking-container {
  height: 100vh;
  background: radial-gradient(circle, #1a2332 0%, #080c12 100%);
  display: flex;
}
.main-card {
  max-width: 600px;
  width: 95%;
  border-color: #1f2833;
}
.title {
  font-size: 16px;
  letter-spacing: 2px;
}
.ranking-table-container {
  max-height: 380px;
  overflow-y: auto;
  border: 3px solid #333;
}
.ranking-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9px;
}
th, td {
  padding: 10px 8px;
  border-bottom: 2px solid #333;
}
th {
  background-color: #0b0c10;
  color: #888;
  font-weight: normal;
}
tbody tr {
  background-color: #1f2833;
}
tbody tr:hover {
  background-color: #2b3a4a;
}
.current-player {
  background-color: #1a2f2d !important;
  border-left: 4px solid var(--color-secondary);
}
.rank-col {
  width: 15%;
  color: #ff6b35;
}
.name-col {
  width: 45%;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.score-col {
  width: 25%;
  font-weight: bold;
}
.waves-col {
  width: 15%;
}
.label {
  font-size: 9px;
}
.header-cell {
  font-size: 8px;
}
</style>
