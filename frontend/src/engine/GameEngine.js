import Renderer from './Renderer.js';
import InputHandler from './InputHandler.js';
import WaveManager from './WaveManager.js';
import CollisionManager from './CollisionManager.js';
import VfxManager from './VfxManager.js';
import Tower from './entities/Tower.js';
import Hero from './entities/Hero.js';
import Soldier from './entities/Soldier.js';
import { TOWER_DATA } from './data/towerData.js';
import { WAVE_DATA } from './data/waveData.js';
import { ENEMY_DATA } from './data/enemyData.js';
import { LEVEL_DATA } from './data/levelData.js';
import { TILE_SIZE, MAP_COLS, MAP_ROWS } from './data/mapData.js';
import { distance } from './utils/math.js';

export default class GameEngine {
  constructor(canvas, levelId, callbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.levelId = levelId || 1;
    this.callbacks = callbacks || {}; // { onStateChange, onGameOver, onWaveComplete, onSelectTower }
    
    // Load dynamic level configuration
    const level = LEVEL_DATA.find(l => l.id === this.levelId) || LEVEL_DATA[0];
    this.levelConfig = level;
    
    // Deep copy grid to avoid sharing references
    this.mapGrid = JSON.parse(JSON.stringify(level.mapGrid));
    this.pathWaypoints = level.pathWaypoints;

    this.upgrades = this.callbacks.upgrades || {};

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
    this.soldiers = [];

    // Hero initialization (Package A)
    const spawnX = this.pathWaypoints[0].x;
    const spawnY = this.pathWaypoints[0].y;
    this.hero = new Hero(spawnX, spawnY);
    this.selectedHero = false;

    // Mana & Spells initialization (Package B)
    this.maxMana = 100 + (this.upgrades.maxMana || 0) * 15;
    this.mana = this.maxMana;
    this.spells = {
      meteor: { cooldown: 0, maxCooldown: 15, cost: 50 },
      blizzard: { cooldown: 0, maxCooldown: 12, cost: 40 },
      reinforce: { cooldown: 0, maxCooldown: 10, cost: 30 }
    };
    this.placingSpellType = null;

    // Weather initialization (Package E)
    this.weather = 'clear'; // 'clear' | 'rain' | 'snow'
    this.weatherTimer = 30.0;

    // Place obstacles dynamically on grid (Package E)
    this.setupObstacles();

    // Adjust starting gold and HP based on upgrades (Package C)
    const goldBonus = (this.upgrades.startingGold || 0) * 25;
    const hpBonus = (this.upgrades.startingHp || 0) * 2;

    this.gameState = {
      gold: level.initialGold + goldBonus,
      hp: 20 + (level.hpBonus || 0) + hpBonus,
      currentWave: 0,
      enemiesKilled: 0,
      totalGoldEarned: level.initialGold + goldBonus,
      status: 'idle', // 'idle' | 'playing' | 'won' | 'lost'
      waveActive: false,
      mana: this.mana,
      maxMana: this.maxMana,
      weather: this.weather,
      heroLevel: this.hero.level,
      heroHp: this.hero.hp,
      heroMaxHp: this.hero.maxHp,
      heroXp: this.hero.xp,
      heroXpNeeded: this.hero.xpNeeded,
      heroAlive: this.hero.alive,
      heroKoTimer: this.hero.koTimer
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

  setupObstacles() {
    let count = 0;
    // Find buildable cells next to path and place rock debris (9)
    for (let r = 1; r < MAP_ROWS - 1; r++) {
      for (let c = 1; c < MAP_COLS - 1; c++) {
        if (this.mapGrid[r][c] === 0) {
          const hasPath = 
            this.mapGrid[r - 1][c] === 1 || 
            this.mapGrid[r + 1][c] === 1 || 
            this.mapGrid[r][c - 1] === 1 || 
            this.mapGrid[r][c + 1] === 1;
          if (hasPath && Math.random() < 0.15) {
            this.mapGrid[r][c] = 9; // Debris Rock obstacle
            count++;
            if (count >= 3) return;
          }
        }
      }
    }
  }

  update(dt) {
    if (this.gameState.status !== 'playing') return;

    // 1. Weather Cycle (Package E)
    this.weatherTimer -= dt;
    if (this.weatherTimer <= 0) {
      this.weatherTimer = 30.0;
      const weathers = ['clear', 'rain', 'snow'];
      const currentIdx = weathers.indexOf(this.weather);
      this.weather = weathers[(currentIdx + 1) % weathers.length];
    }

    // 2. Mana Regen & Cooldown reduction (Package B)
    this.mana = Math.min(this.maxMana, this.mana + 5 * dt);
    for (const spell of Object.values(this.spells)) {
      if (spell.cooldown > 0) {
        spell.cooldown -= dt;
      }
    }

    // 3. Spawning & VFX update
    this.vfxManager.update(dt);
    if (this.gameState.waveActive) {
      this.waveManager.update(dt, this.enemies);
    }

    // Boss Golem summon ability (Package D)
    for (const enemy of this.enemies) {
      if (enemy.alive && enemy.type === 'boss') {
        if (!enemy.summonTimer) enemy.summonTimer = 0;
        enemy.summonTimer += dt;
        if (enemy.summonTimer >= 6.0) { // spawn skeleton helper every 6s
          enemy.summonTimer = 0;
          const pathCopy = this.waveManager.path.map(p => ({ x: p.x, y: p.y }));
          const skeleton = new Enemy({
            type: 'skeleton',
            name: 'Golem Minion',
            hp: 60,
            speed: 1.5,
            goldDrop: 5
          }, pathCopy);
          skeleton.x = enemy.x;
          skeleton.y = enemy.y;
          skeleton.currentPathIndex = enemy.currentPathIndex;
          this.enemies.push(skeleton);
          this.vfxManager.spawnFloatingText(enemy.x, enemy.y, "SUMMON", '#ECEFF1');
        }
      }
    }

    // 4. Update blocker combat queries
    this.updateCombatBlocks();

    // 5. Update soldiers list (Package B)
    for (let i = this.soldiers.length - 1; i >= 0; i--) {
      const soldier = this.soldiers[i];
      soldier.update(dt, this.enemies);
      if (!soldier.alive) {
        this.soldiers.splice(i, 1);
      }
    }

    // 6. Update Hero (Package A)
    this.hero.update(dt, this.enemies);

    // 7. Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      // Apply weather speed adjustments (Package E)
      if (this.weather === 'snow') {
        enemy.baseSpeed = ENEMY_DATA[enemy.type].speed * 0.8; // 20% slow
      } else {
        enemy.baseSpeed = ENEMY_DATA[enemy.type].speed;
      }

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

    // 8. Update towers (target and shoot)
    for (const tower of this.towers) {
      // Weather stats adjustments (Package E)
      const baseDmg = TOWER_DATA[tower.type].damage;
      const baseRange = TOWER_DATA[tower.type].range;
      
      let weatherDmgMult = 1.0;
      let weatherRangeBonus = 0;

      if (tower.type === 'tesla' && this.weather === 'rain') {
        weatherDmgMult = 1.3;
        weatherRangeBonus = 25;
      } else if (tower.type === 'mage' && this.weather === 'rain') {
        weatherDmgMult = 0.8;
      }

      // Permanent Meta Upgrade Damage bonus (Package C)
      const upgradeDmgBonus = 1.0 + (tower.type === 'archer' ? (this.upgrades.archerDmg || 0) * 0.1 : 0);

      tower.damage = Math.floor(baseDmg * weatherDmgMult * upgradeDmgBonus);
      tower.range = baseRange + weatherRangeBonus;

      tower.update(dt, this.enemies, this.bullets);
    }

    // 9. Update bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      const wasActive = bullet.active;
      
      // Ice slow duration weather modifier (Package E)
      if (bullet.type === 'ice' && this.weather === 'snow') {
        bullet.hit = function(enemies) {
          if (this.target && this.target.alive) {
            this.target.takeDamage(this.damage);
            this.target.applySlow(4.0); // snow weather doubles ice freeze slow duration (4.0s instead of 2.0s)
          }
          this.active = false;
        };
      }

      bullet.update(dt, this.enemies);
      if (!bullet.active) {
        if (wasActive && bullet.target) {
          const color = bullet.type === 'ice' ? '#00E5FF' : 
                        bullet.type === 'mage' ? '#FF5722' : 
                        bullet.type === 'cannon' ? '#757575' : 
                        bullet.type === 'tesla' ? '#FFF176' : 
                        bullet.type === 'poison' ? '#4CAF50' : '#FFD54F';
          this.vfxManager.spawnSparks(bullet.x, bullet.y, color, 8);
        }
        this.bullets.splice(i, 1);
      }
    }

    // 10. Collision checks
    this.collisionManager.checkBulletEnemyCollisions(this.bullets, this.enemies);

    // 11. Handle dead enemies and drop gold + hero XP
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (!enemy.alive) {
        this.gameState.gold += enemy.goldDrop;
        this.gameState.totalGoldEarned += enemy.goldDrop;
        this.gameState.enemiesKilled++;
        this.vfxManager.spawnFloatingText(enemy.x, enemy.y, `+${enemy.goldDrop} GOLD`, '#FFD54F');
        
        // Hero gains XP on kills (Package A)
        this.hero.gainXp(12);

        this.enemies.splice(i, 1);
      }
    }

    // 12. Check wave completion
    if (this.gameState.waveActive && this.waveManager.isWaveComplete(this.enemies)) {
      this.completeWave();
    }

    this.syncState();
  }

  updateCombatBlocks() {
    for (const enemy of this.enemies) {
      if (!enemy.alive || enemy.blockedBy) continue;

      // 1. Check reinforcement soldiers
      for (const soldier of this.soldiers) {
        if (soldier.alive) {
          const d = distance(enemy.x, enemy.y, soldier.x, soldier.y);
          if (d <= 20) {
            enemy.blockedBy = soldier;
            break;
          }
        }
      }

      if (enemy.blockedBy) continue;

      // 2. Check Knight Hero
      if (this.hero.alive) {
        const d = distance(enemy.x, enemy.y, this.hero.x, this.hero.y);
        if (d <= 22) {
          enemy.blockedBy = this.hero;
        }
      }
    }
  }

  clearObstacle(gridX, gridY) {
    if (this.gameState.gold >= 50 && this.mapGrid[gridY][gridX] === 9) {
      this.gameState.gold -= 50;
      this.mapGrid[gridY][gridX] = 0; // cleared!
      this.vfxManager.spawnSparks(gridX * TILE_SIZE + TILE_SIZE/2, gridY * TILE_SIZE + TILE_SIZE/2, '#795548', 12);
      this.selectedTower = null;
      if (this.callbacks.onSelectTower) this.callbacks.onSelectTower(null);
      this.syncState();
    }
  }

  render() {
    this.renderer.clear();
    this.renderer.drawMap(this.mapGrid, this.levelConfig.theme);
    this.renderer.drawObstacles(this.mapGrid);
    this.renderer.drawTowers(this.towers);
    this.renderer.drawSoldiers(this.soldiers);
    this.renderer.drawHero(this.hero, this.selectedHero);
    this.renderer.drawEnemies(this.enemies);
    this.renderer.drawBullets(this.bullets);
    this.renderer.drawVfx(this.vfxManager.particles, this.vfxManager.texts);
    this.renderer.drawHealthBars(this.enemies);
    this.renderer.drawTowerRanges(this.selectedTower);
    this.renderer.drawPlacementPreview(this.placementPreview);
    this.renderer.drawSpellPreview(this.placingSpellType, this.mouseX, this.mouseY);
    this.renderer.drawWeather(this.weather);
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

    const cx = gx * TILE_SIZE + TILE_SIZE / 2;
    const cy = gy * TILE_SIZE + TILE_SIZE / 2;

    // 1. Spell Placement Mode (Package B)
    if (this.placingSpellType) {
      this.castSpell(this.placingSpellType, cx, cy, gx, gy);
      this.placingSpellType = null;
      return;
    }

    // 2. Hero Move Command Mode (Package A)
    if (this.selectedHero) {
      this.hero.targetX = cx;
      this.hero.targetY = cy;
      this.selectedHero = false;
      this.vfxManager.spawnFloatingText(cx, cy, "MOVE HERO", '#FFEE58');
      this.syncState();
      return;
    }

    // 3. Hero Click Selection (Package A)
    const distToHero = distance(cx, cy, this.hero.x, this.hero.y);
    if (distToHero <= 24 && this.hero.alive) {
      this.selectedHero = true;
      this.selectedTower = null;
      if (this.callbacks.onSelectTower) {
        this.callbacks.onSelectTower(null);
      }
      this.syncState();
      return;
    }

    // 4. Obstacle Click Selection (Package E)
    if (this.mapGrid[gy][gx] === 9) {
      this.selectedTower = { type: 'obstacle', gridX: gx, gridY: gy, cost: 50 };
      if (this.callbacks.onSelectTower) {
        this.callbacks.onSelectTower(this.selectedTower);
      }
      this.syncState();
      return;
    }

    // 5. Tower Placement Mode
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
    this.mouseX = mx;
    this.mouseY = my;
    if (this.placingTowerType && this.placementPreview) {
      this.placementPreview.gridX = gx;
      this.placementPreview.gridY = gy;
      this.placementPreview.placeable = this.isCellPlaceable(gx, gy);
    }
  }

  handleCanvasRightClick() {
    // Clear placing modes or selected units
    if (this.placingTowerType) {
      this.selectTowerType(null);
    } else if (this.placingSpellType) {
      this.placingSpellType = null;
    } else if (this.selectedHero) {
      this.selectedHero = false;
    } else if (this.selectedTower) {
      this.selectedTower = null;
      if (this.callbacks.onSelectTower) {
        this.callbacks.onSelectTower(null);
      }
    }
    this.syncState();
  }

  selectSpellType(type) {
    if (!type) {
      this.placingSpellType = null;
      return;
    }
    const spell = this.spells[type];
    if (this.mana >= spell.cost && spell.cooldown <= 0) {
      this.placingSpellType = type;
      this.placingTowerType = null;
      this.placementPreview = null;
      this.selectedHero = false;
      this.selectedTower = null;
      if (this.callbacks.onSelectTower) this.callbacks.onSelectTower(null);
    }
  }

  castSpell(type, cx, cy, gx, gy) {
    const spell = this.spells[type];
    if (this.mana < spell.cost || spell.cooldown > 0) return;

    this.mana -= spell.cost;
    spell.cooldown = spell.maxCooldown;

    if (type === 'meteor') {
      // Deal high damage in 80px AoE
      for (const enemy of this.enemies) {
        if (enemy.alive) {
          const d = distance(cx, cy, enemy.x, enemy.y);
          if (d <= 80) {
            enemy.takeDamage(120);
          }
        }
      }
      this.vfxManager.spawnSparks(cx, cy, '#FF5722', 20);
      this.vfxManager.spawnSparks(cx, cy, '#FF9800', 10);
      this.vfxManager.spawnFloatingText(cx, cy, "METEOR!", '#FF5722');
    } else if (type === 'blizzard') {
      // Freeze enemies in 100px AoE (sets speed to 30% for 6s)
      for (const enemy of this.enemies) {
        if (enemy.alive) {
          const d = distance(cx, cy, enemy.x, enemy.y);
          if (d <= 100) {
            enemy.applySlow(6.0);
          }
        }
      }
      this.vfxManager.spawnSparks(cx, cy, '#00E5FF', 20);
      this.vfxManager.spawnSparks(cx, cy, '#E0F7FA', 10);
      this.vfxManager.spawnFloatingText(cx, cy, "BLIZZARD!", '#00E5FF');
    } else if (type === 'reinforce') {
      // Spawn 2 blockade soldiers on paths
      const s1 = new Soldier(cx - 15, cy - 15);
      const s2 = new Soldier(cx + 15, cy + 15);
      this.soldiers.push(s1, s2);
      this.vfxManager.spawnSparks(cx, cy, '#8D6E63', 8);
      this.vfxManager.spawnFloatingText(cx, cy, "DEFENDERS ARRISED", '#FFF');
    }

    this.syncState();
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
      gameSpeed: this.gameSpeed,
      mana: Math.floor(this.mana),
      maxMana: this.maxMana,
      weather: this.weather,
      heroLevel: this.hero.level,
      heroHp: this.hero.hp,
      heroMaxHp: this.hero.maxHp,
      heroXp: this.hero.xp,
      heroXpNeeded: this.hero.xpNeeded,
      heroAlive: this.hero.alive,
      heroKoTimer: Math.ceil(this.hero.koTimer)
    };
  }

  syncState() {
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(this.getState());
    }
  }
}
