<template>
  <div class="game-view-container pa-4 fill-height">
    <!-- Header Back to Menu -->
    <v-row dense class="align-center mb-2">
      <v-col cols="12" class="d-flex justify-space-between align-center wrap-header">
        <div class="d-flex gap-4 align-center">
          <div class="font-game player-banner text-amber font-size-10">
            ⚔️ HERO: {{ gameStore.playerName }}
          </div>
          <div class="font-game player-banner text-blue font-size-10">
            ☁️ WEATHER: {{ gameStore.weather.toUpperCase() }}
          </div>
        </div>
        <button class="pixel-btn danger font-size-8" @click="goHome">
          QUIT TO MENU
        </button>
      </v-col>
    </v-row>

    <!-- Hero Status Bar (Package A) -->
    <v-row dense class="mb-2">
      <v-col cols="12">
        <div class="pixel-card py-2 px-4 hero-status-card">
          <div v-if="gameStore.heroAlive" class="d-flex justify-space-between align-center font-game font-size-9 text-white">
            <span>🛡️ HERO Lv{{ gameStore.heroLevel }}</span>
            <span>HP: {{ gameStore.heroHp }}/{{ gameStore.heroMaxHp }}</span>
            <span>XP: {{ gameStore.heroXp }}/{{ gameStore.heroXpNeeded }}</span>
          </div>
          <div v-else class="text-center font-game font-size-9 text-red font-weight-bold">
            💀 HERO KNOCKED OUT (REVIVING IN {{ gameStore.heroKoTimer }}s)
          </div>
        </div>
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
        <!-- Spells Panel (Package B) -->
        <div class="pixel-card py-3 px-3 font-game spell-panel">
          <div class="text-center title mb-2">SPELL DOCK</div>
          <div class="text-center mana-bar mb-3 text-blue">🔮 MANA: {{ gameStore.mana }}/{{ gameStore.maxMana }}</div>
          
          <div class="d-flex justify-space-around">
            <button 
              v-for="spell in spells" 
              :key="spell.key"
              class="spell-btn d-flex flex-column align-center justify-center cursor-pointer"
              :class="{ active: gameStore.placingSpellType === spell.key, disabled: gameStore.mana < spell.cost }"
              @click="selectSpellType(spell.key)"
            >
              <span class="spell-emoji">{{ spell.emoji }}</span>
              <div class="spell-cost mt-1">🔮{{ spell.cost }}</div>
            </button>
          </div>
        </div>

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
          @clear-obstacle="handleClearObstacle"
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
const { startWave, selectTowerType, selectSpellType, clearObstacle, upgradeTower, sellTower, setSpeed, destroy } = useGameEngine();

const availableTowers = computed(() => Object.values(TOWER_DATA));

const spells = [
  { key: 'meteor', emoji: '☄️', cost: 50, name: 'Meteor' },
  { key: 'blizzard', emoji: '❄️', cost: 40, name: 'Blizzard' },
  { key: 'reinforce', emoji: '🛡️', cost: 30, name: 'Reinforce' }
];

const gameStats = computed(() => ({
  wavesCompleted: gameStore.currentWave,
  enemiesKilled: gameStore.enemiesKilled,
  totalGoldEarned: gameStore.totalGoldEarned,
  remainingHP: gameStore.hp,
  timePlayed: gameStore.timePlayed
}));

onMounted(() => {
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

function handleClearObstacle(pos) {
  clearObstacle(pos.x, pos.y);
}

function restartGame() {
  destroy();
  gameStore.resetGame();
  router.go(0);
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
  font-size: 10px;
}
.gap-3 {
  gap: 12px;
}
.gap-4 {
  gap: 16px;
}
.font-size-10 {
  font-size: 10px;
}
.font-size-9 {
  font-size: 9px;
}
.font-size-8 {
  font-size: 8px;
}
.position-relative {
  position: relative;
}
.wrap-header {
  border-bottom: 3px solid #1f2833;
  padding-bottom: 8px;
}
.hero-status-card {
  border-color: #00e676;
  background-color: #1a2f2d;
}
.spell-panel {
  border-color: #ff5722;
  background-color: #1e1310;
}
.spell-panel .title {
  font-size: 10px;
  color: #fff;
  border-bottom: 3px solid #333;
  padding-bottom: 6px;
}
.mana-bar {
  font-size: 9px;
}
.spell-btn {
  background-color: #0b0c10;
  border: 3px solid #333;
  width: 54px;
  height: 54px;
  transition: all 0.1s ease;
}
.spell-btn:hover:not(.disabled) {
  border-color: #ff5722;
  background-color: #2e1d17;
}
.spell-btn.active {
  border-color: #ffee58;
  background-color: #3b281f;
}
.spell-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background-color: #111;
  border-color: #222;
}
.spell-emoji {
  font-size: 18px;
}
.spell-cost {
  font-size: 7px;
  color: #81d4fa;
}
</style>
