import { ref, computed } from 'vue'; // Standard imports
import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', () => {
  // Player state
  const playerName = ref('');
  const playerId = ref(null);

  // Game state (synced from engine)
  const gold = ref(200);
  const hp = ref(20);
  const currentWave = ref(0);
  const totalWaves = ref(10);
  const waveActive = ref(false);
  const gameSpeed = ref(1);
  const gameStatus = ref('idle'); // 'idle' | 'playing' | 'won' | 'lost'

  // Stats
  const enemiesKilled = ref(0);
  const totalGoldEarned = ref(200);
  const timePlayed = ref(0);

  // Selected tower on map (for info panel)
  const selectedTower = ref(null);

  // Tower placement mode
  const placingTowerType = ref(null); // null | 'archer' | 'mage' | 'ice'

  // Timer reference
  let timeInterval = null;

  function startGameTimer() {
    stopGameTimer();
    timeInterval = setInterval(() => {
      if (gameStatus.value === 'playing') {
        timePlayed.value++;
      }
    }, 1000);
  }

  function stopGameTimer() {
    if (timeInterval) {
      clearInterval(timeInterval);
      timeInterval = null;
    }
  }

  // Actions
  function updateFromEngine(engineState) {
    gold.value = engineState.gold;
    hp.value = engineState.hp;
    currentWave.value = engineState.currentWave;
    enemiesKilled.value = engineState.enemiesKilled;
    totalGoldEarned.value = engineState.totalGoldEarned;
    waveActive.value = engineState.waveActive;
    gameSpeed.value = engineState.gameSpeed;
    
    if (engineState.status !== gameStatus.value) {
      gameStatus.value = engineState.status;
      if (gameStatus.value === 'playing') {
        startGameTimer();
      } else if (gameStatus.value === 'won' || gameStatus.value === 'lost') {
        stopGameTimer();
      }
    }
  }

  function resetGame() {
    gold.value = 200;
    hp.value = 20;
    currentWave.value = 0;
    waveActive.value = false;
    gameSpeed.value = 1;
    gameStatus.value = 'idle';
    enemiesKilled.value = 0;
    totalGoldEarned.value = 200;
    timePlayed.value = 0;
    selectedTower.value = null;
    placingTowerType.value = null;
    stopGameTimer();
  }

  const finalScore = computed(() => {
    // Score = (Enemies killed × 10) + (Gold remaining × 2) + (HP remaining × 50) + (Wave bonus)
    // Wave bonus = 100 × wave_number cho mỗi wave hoàn thành
    let waveBonus = 0;
    for (let i = 1; i <= currentWave.value; i++) {
      waveBonus += 100 * i;
    }
    return (enemiesKilled.value * 10) + (gold.value * 2) + (hp.value * 50) + waveBonus;
  });

  return {
    playerName,
    playerId,
    gold,
    hp,
    currentWave,
    totalWaves,
    waveActive,
    gameSpeed,
    gameStatus,
    enemiesKilled,
    totalGoldEarned,
    timePlayed,
    selectedTower,
    placingTowerType,
    updateFromEngine,
    resetGame,
    finalScore,
    startGameTimer,
    stopGameTimer
  };
});
