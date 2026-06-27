import { LEVEL_DATA } from '../engine/data/levelData.js';
import { ref, computed } from 'vue'; // Standard imports
import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', () => {
  // Player state
  const playerName = ref('');
  const playerId = ref(null);

  // Selected level
  const selectedLevel = ref(1);

  // Gói C: Meta-Upgrades state
  const rubies = ref(parseInt(localStorage.getItem('pixel_defense_rubies') || '0', 10));
  const upgrades = ref(JSON.parse(localStorage.getItem('pixel_defense_upgrades') || '{"archerDmg":0,"startingGold":0,"startingHp":0,"maxMana":0}'));

  // Game state (synced from engine)
  const gold = ref(200);
  const hp = ref(20);
  const currentWave = ref(0);
  const totalWaves = ref(12);
  const waveActive = ref(false);
  const gameSpeed = ref(1);
  const gameStatus = ref('idle');

  // Spells, Hero, and Weather stats synced from engine
  const mana = ref(100);
  const maxMana = ref(100);
  const weather = ref('clear');
  const heroLevel = ref(1);
  const heroHp = ref(300);
  const heroMaxHp = ref(300);
  const heroXp = ref(0);
  const heroXpNeeded = ref(100);
  const heroAlive = ref(true);
  const heroKoTimer = ref(0);

  // Stats
  const enemiesKilled = ref(0);
  const totalGoldEarned = ref(200);
  const timePlayed = ref(0);

  // Selected tower on map (for info panel)
  const selectedTower = ref(null);

  // Tower placement mode
  const placingTowerType = ref(null);
  const placingSpellType = ref(null); // Active spell selection

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

  function buyUpgrade(key, cost) {
    if (rubies.value >= cost) {
      rubies.value -= cost;
      upgrades.value[key] = (upgrades.value[key] || 0) + 1;
      saveToLocalStorage();
      return true;
    }
    return false;
  }

  function saveToLocalStorage() {
    localStorage.setItem('pixel_defense_rubies', rubies.value.toString());
    localStorage.setItem('pixel_defense_upgrades', JSON.stringify(upgrades.value));
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

    mana.value = engineState.mana;
    maxMana.value = engineState.maxMana;
    weather.value = engineState.weather;
    heroLevel.value = engineState.heroLevel;
    heroHp.value = engineState.heroHp;
    heroMaxHp.value = engineState.heroMaxHp;
    heroXp.value = engineState.heroXp;
    heroXpNeeded.value = engineState.heroXpNeeded;
    heroAlive.value = engineState.heroAlive;
    heroKoTimer.value = engineState.heroKoTimer;
    
    if (engineState.status !== gameStatus.value) {
      const oldStatus = gameStatus.value;
      gameStatus.value = engineState.status;
      
      if (gameStatus.value === 'playing') {
        startGameTimer();
      } else if (gameStatus.value === 'won' || gameStatus.value === 'lost') {
        stopGameTimer();
        
        // Award Rubies (Package C)
        if (oldStatus === 'playing') {
          let earnedRubies = 0;
          if (gameStatus.value === 'won') {
            earnedRubies = 10 * selectedLevel.value + 5 * currentWave.value;
          } else {
            earnedRubies = 1 * currentWave.value;
          }
          rubies.value += earnedRubies;
          saveToLocalStorage();
        }
      }
    }
  }

  function resetGame() {
    const level = LEVEL_DATA.find(l => l.id === selectedLevel.value) || LEVEL_DATA[0];
    
    // Apply starting gold and HP upgrades (Package C)
    const goldBonus = (upgrades.value.startingGold || 0) * 25;
    const hpBonus = (upgrades.value.startingHp || 0) * 2;

    gold.value = level.initialGold + goldBonus;
    hp.value = 20 + level.hpBonus + hpBonus;
    currentWave.value = 0;
    waveActive.value = false;
    gameSpeed.value = 1;
    gameStatus.value = 'idle';
    enemiesKilled.value = 0;
    totalGoldEarned.value = level.initialGold + goldBonus;
    timePlayed.value = 0;
    selectedTower.value = null;
    placingTowerType.value = null;
    placingSpellType.value = null;
    
    mana.value = 100 + (upgrades.value.maxMana || 0) * 15;
    maxMana.value = mana.value;
    weather.value = 'clear';
    heroLevel.value = 1;
    heroHp.value = 300;
    heroMaxHp.value = 300;
    heroXp.value = 0;
    heroXpNeeded.value = 100;
    heroAlive.value = true;
    heroKoTimer.value = 0;
    
    stopGameTimer();
  }

  const finalScore = computed(() => {
    let waveBonus = 0;
    for (let i = 1; i <= currentWave.value; i++) {
      waveBonus += 100 * i;
    }
    return (enemiesKilled.value * 10) + (gold.value * 2) + (hp.value * 50) + waveBonus;
  });

  return {
    playerName,
    playerId,
    selectedLevel,
    rubies,
    upgrades,
    buyUpgrade,
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
    placingSpellType,
    mana,
    maxMana,
    weather,
    heroLevel,
    heroHp,
    heroMaxHp,
    heroXp,
    heroXpNeeded,
    heroAlive,
    heroKoTimer,
    updateFromEngine,
    resetGame,
    finalScore,
    startGameTimer,
    stopGameTimer
  };
});
