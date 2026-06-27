<template>
  <div class="home-container d-flex align-center justify-center fill-height">
    <div class="d-flex gap-4 main-wrapper align-stretch">
      <!-- Left Column: Main Game Setup -->
      <div class="pixel-card py-8 px-10 text-center main-card d-flex flex-column justify-space-between">
        <div>
          <h1 class="font-game game-title mb-4 blink">PIXEL FORTRESS</h1>
          <p class="subtitle mb-8 text-grey text-uppercase font-weight-bold">Fantasy Medieval Tower Defense</p>
          
          <div class="input-container mb-6">
            <label class="font-game label d-block mb-3">ENTER YOUR NAME</label>
            <input 
              type="text" 
              v-model="nameInput"
              placeholder="HERO..."
              maxlength="50"
              class="pixel-input text-center py-3 px-4"
              @keyup.enter="playGame"
            />
            <div v-if="errorMsg" class="error-msg text-red font-game mt-2">{{ errorMsg }}</div>
          </div>

          <!-- Level Selection -->
          <div class="level-select-container mb-8">
            <label class="font-game label d-block mb-4">SELECT LEVEL</label>
            <div class="level-grid d-flex justify-space-between align-stretch gap-2">
              <div 
                v-for="level in LEVEL_DATA" 
                :key="level.id"
                class="level-card flex-1 py-3 px-2 d-flex flex-column justify-space-between cursor-pointer"
                :class="{ active: gameStore.selectedLevel === level.id }"
                @click="gameStore.selectedLevel = level.id"
              >
                <div class="level-info">
                  <h3 class="level-name mb-1">{{ level.name }}</h3>
                  <span class="difficulty-badge" :class="level.difficulty.toLowerCase()">
                    {{ level.difficulty }}
                  </span>
                </div>
                <p class="level-desc mt-2 text-grey-lighten-1">{{ level.description }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="actions d-flex flex-column align-stretch">
          <button 
            class="pixel-btn mb-4" 
            :disabled="loading"
            @click="playGame"
          >
            {{ loading ? 'ENTER THE FORTRESS...' : 'PLAY GAME' }}
          </button>
          <button 
            class="pixel-btn secondary"
            @click="goRanking"
          >
            LEADERBOARD
          </button>
        </div>
      </div>

      <!-- Right Column: Upgrades Shop (Package C) -->
      <div class="pixel-card py-8 px-8 shop-card font-game">
        <div class="shop-title text-center text-amber mb-3">UPGRADE SHOP</div>
        <div class="rubies-count text-center text-amber-accent-2 mb-4">
          ♦️ {{ gameStore.rubies }} RUBIES
        </div>
        
        <div class="upgrades-list">
          <div v-for="upg in shopItems" :key="upg.key" class="upg-item mb-3 py-2 px-3">
            <div class="d-flex justify-space-between align-center font-size-9">
              <span class="upg-name text-white">{{ upg.name }}</span>
              <span class="upg-lvl text-blue">LVL {{ gameStore.upgrades[upg.key] || 0 }}/3</span>
            </div>
            <div class="upg-desc mt-1">{{ upg.desc }}</div>
            <button 
              v-if="(gameStore.upgrades[upg.key] || 0) < 3"
              class="pixel-btn mt-2 w-100 sm-btn"
              :disabled="gameStore.rubies < upg.costs[gameStore.upgrades[upg.key] || 0]"
              @click="buyUpgrade(upg.key, upg.costs[gameStore.upgrades[upg.key] || 0])"
            >
              UPGRADE (-♦️{{ upg.costs[gameStore.upgrades[upg.key] || 0] }})
            </button>
            <div v-else class="max-lvl text-center text-green mt-2">MAX LEVEL</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '../stores/playerStore.js';
import { useGameStore } from '../stores/gameStore.js';
import { LEVEL_DATA } from '../engine/data/levelData.js';

const nameInput = ref('');
const errorMsg = ref('');
const loading = ref(false);

const router = useRouter();
const playerStore = usePlayerStore();
const gameStore = useGameStore();

const shopItems = [
  { key: 'archerDmg', name: '🏹 ARCHER DECK', desc: 'Archer tower damage +10% per level.', costs: [10, 25, 50] },
  { key: 'startingGold', name: '🪙 GOLD COFFERS', desc: 'Start game with +25 gold.', costs: [15, 30, 60] },
  { key: 'startingHp', name: '🏰 RAMPART WALLS', desc: 'Castle starts with +2 max HP.', costs: [10, 20, 40] },
  { key: 'maxMana', name: '🔮 MANA ENERGY', desc: 'Spells maximum mana +15.', costs: [15, 30, 50] }
];

function buyUpgrade(key, cost) {
  gameStore.buyUpgrade(key, cost);
}

async function playGame() {
  const name = nameInput.value.trim();
  if (!name) {
    errorMsg.value = 'NAME IS REQUIRED!';
    return;
  }
  
  if (name.length > 50) {
    errorMsg.value = 'MAX 50 CHARACTERS!';
    return;
  }
  
  errorMsg.value = '';
  loading.value = true;
  try {
    await playerStore.loginOrCreate(name);
    gameStore.resetGame();
    router.push('/game');
  } catch (err) {
    console.error(err);
    errorMsg.value = 'SERVER OFFLINE. REDIRECTING...';
    playerStore.player = { id: 999, name: name };
    gameStore.resetGame();
    setTimeout(() => {
      router.push('/game');
    }, 1000);
  } finally {
    loading.value = false;
  }
}

function goRanking() {
  router.push('/ranking');
}
</script>

<style scoped>
.home-container {
  height: 100vh;
  background: radial-gradient(circle, #1a2332 0%, #080c12 100%);
  display: flex;
}
.main-wrapper {
  max-width: 900px;
  width: 95%;
}
.main-card {
  flex: 1.2;
  border-color: #1f2833;
  background-color: rgba(26, 35, 50, 0.95);
}
.shop-card {
  flex: 1;
  border-color: #ffc107;
  background-color: rgba(18, 24, 38, 0.95);
  box-shadow: 0 0 15px rgba(255, 193, 7, 0.15);
  overflow-y: auto;
  max-height: 520px;
}
.shop-title {
  font-size: 16px;
  letter-spacing: 1.5px;
  text-shadow: 2px 2px 0 #000;
}
.rubies-count {
  font-size: 10px;
  font-weight: bold;
}
.upg-item {
  background-color: #0b0c10;
  border: 3px solid #333;
  text-align: left;
}
.upg-name {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
}
.upg-lvl {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
}
.upg-desc {
  font-size: 8px;
  color: #888;
  line-height: 1.3;
}
.sm-btn {
  font-size: 7px;
  padding: 4px;
}
.max-lvl {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
}

.game-title {
  font-size: 26px;
  color: #ff6b35;
  text-shadow: 3px 3px 0 #000;
  letter-spacing: 1px;
}
.subtitle {
  font-size: 11px;
  color: #c5c6c7;
  letter-spacing: 1.5px;
}
.label {
  font-size: 9px;
  color: #c5c6c7;
}
.pixel-input {
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  background-color: #0b0c10;
  border: 3px solid #333;
  color: #fff;
  width: 100%;
  box-shadow: inset 0 0 5px rgba(0,0,0,0.8);
  outline: none;
  text-transform: uppercase;
}
.pixel-input:focus {
  border-color: #ff6b35;
}
.error-msg {
  font-size: 8px;
}

.level-grid {
  display: flex;
  gap: 12px;
}
.level-card {
  background-color: #0b0c10;
  border: 3px solid #333;
  text-align: left;
  transition: all 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.level-card:hover {
  border-color: #777;
  transform: translateY(-2px);
}
.level-card.active {
  border-color: #ff6b35;
  box-shadow: 0 0 10px rgba(255, 107, 53, 0.4);
}
.level-name {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: #fff;
  line-height: 1.4;
}
.difficulty-badge {
  font-family: 'Press Start 2P', monospace;
  font-size: 6px;
  padding: 2px 4px;
  border-radius: 2px;
  text-transform: uppercase;
  font-weight: bold;
}
.difficulty-badge.easy {
  background-color: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
  border: 1px solid #4CAF50;
}
.difficulty-badge.medium {
  background-color: rgba(255, 152, 0, 0.2);
  color: #FF9800;
  border: 1px solid #FF9800;
}
.difficulty-badge.hard {
  background-color: rgba(244, 67, 54, 0.2);
  color: #F44336;
  border: 1px solid #F44336;
}
.level-desc {
  font-size: 9px;
  line-height: 1.4;
  color: #a8a8a8;
}
</style>
