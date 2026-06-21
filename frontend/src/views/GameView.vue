<template>
  <div class="game-view-container pa-4 fill-height">
    <!-- Header Back to Menu -->
    <v-row dense class="align-center mb-2">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <div class="font-game player-banner text-amber font-size-10">
          ⚔️ HERO: {{ gameStore.playerName }}
        </div>
        <button class="pixel-btn danger font-size-8" @click="goHome">
          QUIT TO MENU
        </button>
      </v-col>
    </v-row>

    <!-- Main Game HUD -->
    <v-row dense class="mb-4">
      <v-col cols="12">
        <GameHUD 
          :hp="gameStore.hp"
          :gold="gameStore.gold"
          :wave="gameStore.currentWave"
          :max-wave="gameStore.totalWaves"
        />
      </v-col>
    </v-row>

    <!-- Game Layout -->
    <v-row class="fill-height align-start">
      <!-- Left side: Canvas -->
      <v-col cols="12" md="9" class="pr-md-2 mb-4 mb-md-0 position-relative">
        <GameCanvas />
        
        <!-- Win and Lose Screens as Overlay on Canvas -->
        <WinScreen 
          v-if="gameStore.gameStatus === 'won'"
          :score="gameStore.finalScore"
          :stats="gameStats"
          @submit-score="submitGameScore"
          @play-again="restartGame"
        />
        <LoseScreen 
          v-if="gameStore.gameStatus === 'lost'"
          :wave="gameStore.currentWave"
          :stats="gameStats"
          @retry="restartGame"
          @go-home="goHome"
        />
      </v-col>

      <!-- Right side: Control Panels -->
      <v-col cols="12" md="3" class="pl-md-2 d-flex flex-column gap-3">
        <!-- Defenders Panel -->
        <TowerPanel 
          :towers="availableTowers"
          :gold="gameStore.gold"
          :selected-type="gameStore.placingTowerType"
          @select-tower="selectTowerType"
        />
        
        <!-- Wave Info Panel -->
        <WaveInfo 
          :current-wave="gameStore.currentWave"
          :total-waves="gameStore.totalWaves"
          :wave-active="gameStore.waveActive"
          @start-wave="startWave"
        />

        <!-- Speed Control Panel -->
        <SpeedControl 
          :speed="gameStore.gameSpeed"
          @change-speed="setSpeed"
        />

        <!-- Selected Tower Details Panel -->
        <TowerInfo 
          :selected-tower="gameStore.selectedTower"
          :gold="gameStore.gold"
          @upgrade="upgradeTower"
          @sell="sellTower"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/gameStore.js';
import { usePlayerStore } from '../stores/playerStore.js';
import { useGameEngine } from '../composables/useGameEngine.js';
import { TOWER_DATA } from '../engine/data/towerData.js';

// Components
import GameCanvas from '../components/game/GameCanvas.vue';
import GameHUD from '../components/game/GameHUD.vue';
import TowerPanel from '../components/game/TowerPanel.vue';
import TowerInfo from '../components/game/TowerInfo.vue';
import WaveInfo from '../components/game/WaveInfo.vue';
import SpeedControl from '../components/game/SpeedControl.vue';
import WinScreen from '../components/screens/WinScreen.vue';
import LoseScreen from '../components/screens/LoseScreen.vue';

const router = useRouter();
const gameStore = useGameStore();
const playerStore = usePlayerStore();
const { startWave, selectTowerType, upgradeTower, sellTower, setSpeed, destroy } = useGameEngine();

const availableTowers = computed(() => Object.values(TOWER_DATA));

const gameStats = computed(() => ({
  wavesCompleted: gameStore.currentWave,
  enemiesKilled: gameStore.enemiesKilled,
  totalGoldEarned: gameStore.totalGoldEarned,
  remainingHP: gameStore.hp,
  timePlayed: gameStore.timePlayed
}));

onMounted(() => {
  // Guard clause to redirect if playerName is missing
  if (!gameStore.playerName) {
    router.push('/');
  }
});

async function submitGameScore() {
  try {
    await playerStore.submitGameScore({
      score: gameStore.finalScore,
      wavesCompleted: gameStore.currentWave,
      enemiesKilled: gameStore.enemiesKilled,
      totalGoldEarned: gameStore.totalGoldEarned,
      remainingHP: gameStore.hp,
      timePlayed: gameStore.timePlayed
    });
  } catch (err) {
    console.error('Failed to submit score to DB:', err);
  }
}

function restartGame() {
  destroy();
  // Force simple reload on Vue canvas component by rerouting or reset
  // The GameCanvas onMounted will re-trigger initEngine
  gameStore.resetGame();
  router.go(0); // Standard page reload is extremely robust for game state resets!
}

function goHome() {
  destroy();
  gameStore.resetGame();
  router.push('/');
}
</script>

<style scoped>
.game-view-container {
  min-height: 100vh;
  background-color: #0b0c10;
  overflow-y: auto;
}
.player-banner {
  font-size: 11px;
}
.gap-3 {
  gap: 12px;
}
.font-size-10 {
  font-size: 10px;
}
.font-size-8 {
  font-size: 8px;
}
.position-relative {
  position: relative;
}
</style>
