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

          <!-- Campaign Map -->
          <div class="campaign-map-container mb-4">
            <label class="font-game label d-block mb-2 text-center text-amber">CAMPAIGN MAP (PROGRESS: {{ gameStore.unlockedLevel }}/20)</label>
            <div class="campaign-map border-pixel position-relative">
              <!-- SVG path line drawing connecting nodes -->
              <svg class="map-path-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path :d="svgPath" fill="none" stroke="#222831" stroke-width="2" stroke-dasharray="1,1" />
                <path :d="svgPath" fill="none" stroke="#ffe082" stroke-width="0.8" />
              </svg>
              
              <!-- Map nodes -->
              <div 
                v-for="node in mapNodes" 
                :key="node.id"
                class="map-node font-game cursor-pointer d-flex align-center justify-center"
                :class="{ 
                  unlocked: node.isUnlocked, 
                  completed: node.isCompleted, 
                  active: gameStore.selectedLevel === node.id,
                  locked: !node.isUnlocked
                }"
                :style="{ left: node.x + '%', top: node.y + '%' }"
                @click="selectNode(node)"
              >
                <span class="node-id">{{ node.id }}</span>
                <span v-if="!node.isUnlocked" class="lock-icon">🔒</span>
                <span v-else-if="node.isCompleted" class="complete-flag">⭐</span>
              </div>
            </div>
          </div>

          <!-- Selected Stage Details -->
          <div v-if="selectedNode" class="selected-level-info mb-4 py-2 px-3 text-left">
            <div class="d-flex justify-space-between align-center">
              <span class="lvl-title text-amber text-uppercase">{{ selectedNode.name }}</span>
              <span class="difficulty-badge" :class="selectedNode.difficulty.toLowerCase()">
                {{ selectedNode.difficulty }}
              </span>
            </div>
            <div class="lvl-theme mt-1 text-blue">ENVIRONMENT: {{ selectedNode.theme.toUpperCase() }}</div>
            <p class="lvl-desc mt-1 text-grey">{{ selectedNode.description }}</p>
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
import { ref, computed } from 'vue';
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

// Campaign Map coordinate calculations (4 rows of 5 nodes in a zig-zag snake pattern)
const mapNodes = computed(() => {
  return LEVEL_DATA.map((level, idx) => {
    const row = Math.floor(idx / 5);
    const col = idx % 5;
    
    // Zig-zag coordinate order on odd rows
    const colOrder = (row % 2 === 1) ? (4 - col) : col;
    
    const x = 10 + colOrder * 20; // 10%, 30%, 50%, 70%, 90%
    const y = 12 + row * 25;     // 12%, 37%, 62%, 87%
    
    const isUnlocked = level.id <= gameStore.unlockedLevel;
    const isCompleted = level.id < gameStore.unlockedLevel;
    
    return {
      ...level,
      x,
      y,
      isUnlocked,
      isCompleted
    };
  });
});

const svgPath = computed(() => {
  let pathStr = "";
  mapNodes.value.forEach((node, idx) => {
    if (idx === 0) {
      pathStr += `M ${node.x} ${node.y}`;
    } else {
      pathStr += ` L ${node.x} ${node.y}`;
    }
  });
  return pathStr;
});

const selectedNode = computed(() => {
  return LEVEL_DATA.find(l => l.id === gameStore.selectedLevel) || LEVEL_DATA[0];
});

function selectNode(node) {
  if (node.isUnlocked) {
    gameStore.selectedLevel = node.id;
    errorMsg.value = "";
  } else {
    errorMsg.value = `STAGE ${node.id} IS LOCKED! BEAT PREVIOUS STAGES TO UNLOCK.`;
  }
}

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
  max-width: 980px;
  width: 95%;
}
.main-card {
  flex: 1.4;
  border-color: #1f2833;
  background-color: rgba(26, 35, 50, 0.95);
}
.shop-card {
  flex: 1;
  border-color: #ffc107;
  background-color: rgba(18, 24, 38, 0.95);
  box-shadow: 0 0 15px rgba(255, 193, 7, 0.15);
  overflow-y: auto;
  max-height: 560px;
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

/* Campaign Map Styles */
.campaign-map-container {
  width: 100%;
}
.campaign-map {
  width: 100%;
  height: 230px;
  background-color: #0d1117;
  border-color: #1f2833;
  overflow: hidden;
  position: relative;
}
.map-path-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.map-node {
  position: absolute;
  width: 22px;
  height: 22px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 3px solid #455a64;
  background-color: #263238;
  transition: all 0.2s ease-in-out;
  z-index: 5;
}
.map-node.unlocked {
  border-color: #ff6b35;
  background-color: #3e2723;
  box-shadow: 0 0 5px rgba(255, 107, 53, 0.4);
}
.map-node.completed {
  border-color: #4caf50;
  background-color: #1b5e20;
}
.map-node.active {
  border-color: #ffee58;
  background-color: #f57f17;
  transform: translate(-50%, -50%) scale(1.25);
  box-shadow: 0 0 12px #ffee58;
  z-index: 10;
}
.map-node.locked {
  opacity: 0.5;
  cursor: not-allowed;
}
.node-id {
  font-size: 8px;
  color: #fff;
  pointer-events: none;
}
.lock-icon {
  position: absolute;
  font-size: 8px;
  bottom: -10px;
}
.complete-flag {
  position: absolute;
  font-size: 8px;
  top: -10px;
}

/* Selected level card info */
.selected-level-info {
  background-color: #0b0c10;
  border: 3px solid #333;
  border-radius: 4px;
}
.lvl-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
}
.lvl-theme {
  font-size: 8px;
}
.lvl-desc {
  font-size: 8px;
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
.difficulty-badge.expert {
  background-color: rgba(156, 39, 176, 0.2);
  color: #E040FB;
  border: 1px solid #E040FB;
}
</style>
