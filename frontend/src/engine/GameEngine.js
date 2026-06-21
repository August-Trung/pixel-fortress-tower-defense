import Renderer from './Renderer.js';
import InputHandler from './InputHandler.js';
import WaveManager from './WaveManager.js';
import CollisionManager from './CollisionManager.js';
import VfxManager from './VfxManager.js';
import Tower from './entities/Tower.js';
import { TOWER_DATA } from './data/towerData.js';
import { WAVE_DATA } from './data/waveData.js';
import { LEVEL_DATA } from './data/levelData.js';
import { TILE_SIZE, MAP_COLS, MAP_ROWS } from './data/mapData.js';
import { distance } from './utils/math.js';

export default class GameEngine {
  constructor(canvas, levelId, callbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.levelId = levelId || 1;
    this.callbacks = callbacks; // { onStateChange, onGameOver, onWaveComplete, onSelectTower }
    
    // Load dynamic level configuration
    const level = LEVEL_DATA.find(l => l.id === this.levelId) || LEVEL_DATA[0];
    this.levelConfig = level;
    this.mapGrid = level.mapGrid;
    this.pathWaypoints = level.pathWaypoints;

    this.renderer = new Renderer(this.ctx);
    this.inputHandler = new InputHandler(canvas, {
      onClick: (gx, gy) => this.handleCanvasClick(gx, gy),
      onMouseMove: (gx, gy, mx, my) => this.handleCanvasMouseMove(gx, gy, mx, my),
      onRightClick: () => this.handleCanvasRightClick()
    });

    this.waveManager = new WaveManager(WAVE_DATA, this.pathWaypoints);
    this.collisionManager = new CollisionManager();
    this.vfxManager = new VfxManager();

    this.towers = [];
    this.enemies = [];
    this.bullets = [];

    this.gameState = {
      gold: level.initialGold,
      hp: 20 + (level.hpBonus || 0),
      currentWave: 0,
      enemiesKilled: 0,
      totalGoldEarned: level.initialGold, // Starts with initial gold
      status: 'idle', // 'idle' | 'playing' | 'won' | 'lost'
      waveActive: false
    };

    this.lastTime = 0;
    this.gameSpeed = 1;
    this.running = false;
    this.animFrameId = null;

    this.selectedTower = null;
    this.placingTowerType = null;
    this.placementPreview = null;
  }

  async init() {
    await this.renderer.loadSprites();
    this.syncState();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.gameState.status = 'playing';
    this.loop(this.lastTime);
    this.syncState();
  }

  loop(currentTime) {
    if (!this.running) return;
    
    const rawDeltaTime = (currentTime - this.lastTime) / 1000;
    const deltaTime = rawDeltaTime * this.gameSpeed;
    this.lastTime = currentTime;

    // Cap deltaTime to avoid physics breakages (e.g. background tab tab-switching)
    const dt = Math.min(deltaTime, 0.1);

    this.update(dt);
    this.render();

    this.animFrameId = requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    if (this.gameState.status !== 'playing') return;

    // 1. Spawning & VFX update
    this.vfxManager.update(dt);
    if (this.gameState.waveActive) {
      this.waveManager.update(dt, this.enemies);
    }

    // 2. Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(dt);

      // Check if reached castle
      if (enemy.reachedEnd) {
        this.gameState.hp--;
        this.enemies.splice(i, 1);
        if (this.gameState.hp <= 0) {
          this.gameState.hp = 0;
          this.gameOver('lost');
          return;
        }
      }
    }

    // 3. Update towers (target and shoot)
    for (const tower of this.towers) {
      tower.update(dt, this.enemies, this.bullets);
    }

    // 4. Update bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      const wasActive = bullet.active;
      bullet.update(dt);
      if (!bullet.active) {
        if (wasActive && bullet.target) {
          const color = bullet.type === 'ice' ? '#00E5FF' : bullet.type === 'mage' ? '#FF5722' : '#FFD54F';
          this.vfxManager.spawnSparks(bullet.x, bullet.y, color, 8);
        }
        this.bullets.splice(i, 1);
      }
    }

    // 5. Collision checks (prune dead bullets etc.)
    this.collisionManager.checkBulletEnemyCollisions(this.bullets, this.enemies);

    // 6. Handle dead enemies and drop gold
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (!enemy.alive) {
        this.gameState.gold += enemy.goldDrop;
        this.gameState.totalGoldEarned += enemy.goldDrop;
        this.gameState.enemiesKilled++;
        this.vfxManager.spawnFloatingText(enemy.x, enemy.y, `+${enemy.goldDrop} GOLD`, '#FFD54F');
        this.enemies.splice(i, 1);
      }
    }

    // 7. Check wave completion
    if (this.gameState.waveActive && this.waveManager.isWaveComplete(this.enemies)) {
      this.completeWave();
    }

    this.syncState();
  }

  render() {
    this.renderer.clear();
    this.renderer.drawMap(this.mapGrid, this.levelConfig.theme);
    this.renderer.drawTowers(this.towers);
    this.renderer.drawEnemies(this.enemies);
    this.renderer.drawBullets(this.bullets);
    this.renderer.drawVfx(this.vfxManager.particles, this.vfxManager.texts);
    this.renderer.drawHealthBars(this.enemies);
    this.renderer.drawTowerRanges(this.selectedTower);
    this.renderer.drawPlacementPreview(this.placementPreview);
  }

  stop() {
    this.running = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    this.inputHandler.destroy();
  }

  setSpeed(speed) {
    this.gameSpeed = speed;
    this.syncState();
  }

  // --- Wave Logic ---
  startWave() {
    if (this.gameState.waveActive || this.gameState.status !== 'playing') return;
    
    this.selectedTower = null;
    this.placementPreview = null;
    this.placingTowerType = null;
    if (this.callbacks.onSelectTower) {
      this.callbacks.onSelectTower(null);
    }

    const nextWaveNumber = this.gameState.currentWave + 1;
    this.waveManager.startWave(nextWaveNumber);
    this.gameState.currentWave = nextWaveNumber;
    this.gameState.waveActive = true;
    this.enemies = [];
    this.bullets = [];
    
    this.syncState();
  }

  completeWave() {
    this.gameState.waveActive = false;
    
    // Wave completed bonus gold: 100 * wave_number
    const bonus = 100 * this.gameState.currentWave;
    this.gameState.gold += bonus;
    this.gameState.totalGoldEarned += bonus;

    if (!this.waveManager.hasMoreWaves()) {
      this.gameOver('won');
    } else {
      if (this.callbacks.onWaveComplete) {
        this.callbacks.onWaveComplete(this.gameState.currentWave);
      }
    }
  }

  gameOver(status) {
    this.gameState.status = status;
    this.running = false;
    if (this.callbacks.onGameOver) {
      this.callbacks.onGameOver(status);
    }
    this.syncState();
  }

  // --- Tower Actions ---
  selectTowerType(type) {
    this.placingTowerType = type;
    this.selectedTower = null;
    if (this.callbacks.onSelectTower) {
      this.callbacks.onSelectTower(null);
    }
    
    if (type) {
      const config = TOWER_DATA[type];
      this.placementPreview = {
        gridX: 0,
        gridY: 0,
        range: config.range,
        type: type,
        placeable: false
      };
    } else {
      this.placementPreview = null;
    }
  }

  handleCanvasClick(gx, gy) {
    if (gx < 0 || gx >= MAP_COLS || gy < 0 || gy >= MAP_ROWS) return;

    if (this.placingTowerType) {
      this.placeTower(gx, gy);
    } else {
      // Look for a tower at this cell
      const tower = this.towers.find(t => t.gridX === gx && t.gridY === gy);
      this.selectedTower = tower || null;
      if (this.callbacks.onSelectTower) {
        this.callbacks.onSelectTower(this.selectedTower);
      }
    }
  }

  handleCanvasMouseMove(gx, gy, mx, my) {
    if (this.placingTowerType && this.placementPreview) {
      this.placementPreview.gridX = gx;
      this.placementPreview.gridY = gy;
      this.placementPreview.placeable = this.isCellPlaceable(gx, gy);
    }
  }

  handleCanvasRightClick() {
    // Clear placing mode or selected tower
    if (this.placingTowerType) {
      this.selectTowerType(null);
    } else if (this.selectedTower) {
      this.selectedTower = null;
      if (this.callbacks.onSelectTower) {
        this.callbacks.onSelectTower(null);
      }
    }
  }

  isCellPlaceable(gx, gy) {
    // Check out of bounds
    if (gx < 0 || gx >= MAP_COLS || gy < 0 || gy >= MAP_ROWS) return false;

    // Check grid layout (only grass = 0 is placeable)
    if (this.mapGrid[gy][gx] !== 0) return false;

    // Check existing tower at cell
    const towerExists = this.towers.some(t => t.gridX === gx && t.gridY === gy);
    if (towerExists) return false;

    // Check gold cost
    const config = TOWER_DATA[this.placingTowerType];
    if (!config || this.gameState.gold < config.cost) return false;

    return true;
  }

  placeTower(gx, gy) {
    if (!this.isCellPlaceable(gx, gy)) return;

    const config = TOWER_DATA[this.placingTowerType];
    this.gameState.gold -= config.cost;

    const tower = new Tower(config, gx, gy);
    this.towers.push(tower);

    // Reset placement mode
    this.selectTowerType(null);
    this.syncState();
  }

  upgradeTower(towerId) {
    const tower = this.towers.find(t => t.id === towerId);
    if (!tower || tower.level >= 3) return;

    // Determine cost based on level ratio
    // Level 1 -> 2: cost = 60% of base cost
    // Level 2 -> 3: cost = 100% of base cost
    const baseCost = TOWER_DATA[tower.type].cost;
    const cost = tower.level === 1 ? Math.floor(baseCost * 0.6) : baseCost;

    if (this.gameState.gold < cost) return;

    this.gameState.gold -= cost;
    
    // Compute upgraded stats
    // Level 2: +50% dmg, +10% range
    // Level 3: +100% dmg, +20% range
    const dmgMultiplier = tower.level === 1 ? 1.5 : 2.0;
    const rangeMultiplier = tower.level === 1 ? 1.1 : 1.2;

    const nextDmg = Math.floor(baseCost * 0.0) + TOWER_DATA[tower.type].damage * dmgMultiplier; // simple formula
    const nextRange = TOWER_DATA[tower.type].range * rangeMultiplier;

    tower.upgrade({
      damage: nextDmg,
      range: nextRange,
      fireRate: tower.fireRate, // Fire rate remains constant
      cost: cost
    });

    this.vfxManager.spawnFloatingText(tower.x, tower.y, "LV UP!", "#4CAF50");

    this.syncState();
    // Refresh selections info panel
    if (this.callbacks.onSelectTower) {
      this.callbacks.onSelectTower(tower);
    }
  }

  sellTower(towerId) {
    const index = this.towers.findIndex(t => t.id === towerId);
    if (index === -1) return;

    const tower = this.towers[index];
    const refund = tower.getSellPrice();

    this.gameState.gold += refund;
    this.vfxManager.spawnFloatingText(tower.x, tower.y, `+${refund} GOLD`, '#FFC107');
    this.towers.splice(index, 1);

    if (this.selectedTower && this.selectedTower.id === towerId) {
      this.selectedTower = null;
      if (this.callbacks.onSelectTower) {
        this.callbacks.onSelectTower(null);
      }
    }

    this.syncState();
  }

  getState() {
    return {
      gold: this.gameState.gold,
      hp: this.gameState.hp,
      currentWave: this.gameState.currentWave,
      enemiesKilled: this.gameState.enemiesKilled,
      totalGoldEarned: this.gameState.totalGoldEarned,
      status: this.gameState.status,
      waveActive: this.gameState.waveActive,
      gameSpeed: this.gameSpeed
    };
  }

  syncState() {
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.getState());
    }
  }
}
