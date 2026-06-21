import { useGameStore } from '../stores/gameStore.js';
import GameEngine from '../engine/GameEngine.js';

let engine = null;

export function useGameEngine() {
  const gameStore = useGameStore();

  async function initEngine(canvas) {
    if (engine) {
      engine.stop();
    }

    engine = new GameEngine(canvas, gameStore.selectedLevel, {
      onStateChange: (state) => {
        gameStore.updateFromEngine(state);
      },
      onGameOver: (status) => {
        gameStore.gameStatus = status;
      },
      onWaveComplete: (waveNumber) => {
        // Wave complete notification can go here
      },
      onSelectTower: (tower) => {
        // Map engine selected tower details back to UI
        if (tower) {
          gameStore.selectedTower = {
            id: tower.id,
            gridX: tower.gridX,
            gridY: tower.gridY,
            type: tower.type,
            name: tower.name,
            level: tower.level,
            damage: tower.damage,
            range: tower.range,
            fireRate: tower.fireRate,
            cost: tower.cost,
            totalInvested: tower.totalInvested,
            sellPrice: tower.getSellPrice()
          };
        } else {
          gameStore.selectedTower = null;
        }
      }
    });

    await engine.init();
    engine.start();
    return engine;
  }

  function startWave() {
    if (engine) engine.startWave();
  }

  function selectTowerType(type) {
    if (engine) {
      engine.selectTowerType(type);
      gameStore.placingTowerType = type;
    }
  }

  function upgradeTower(towerId) {
    if (engine) engine.upgradeTower(towerId);
  }

  function sellTower(towerId) {
    if (engine) engine.sellTower(towerId);
  }

  function setSpeed(speed) {
    if (engine) engine.setSpeed(speed);
  }

  function destroy() {
    if (engine) {
      engine.stop();
      engine = null;
    }
    gameStore.resetGame();
  }

  return {
    initEngine,
    startWave,
    selectTowerType,
    upgradeTower,
    sellTower,
    setSpeed,
    destroy
  };
}
