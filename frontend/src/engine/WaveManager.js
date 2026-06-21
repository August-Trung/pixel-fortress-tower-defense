import Enemy from './entities/Enemy.js';
import { ENEMY_DATA } from './data/enemyData.js';

export default class WaveManager {
  constructor(waveData, path) {
    this.waveData = waveData;
    this.path = path;
    this.currentWave = 0;
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.spawnInterval = 0.8; // SPAWN_INTERVAL = 0.8s
    this.waveActive = false;
    this.waveComplete = false;
  }

  startWave(waveNumber) {
    this.currentWave = waveNumber;
    const wave = this.waveData[waveNumber - 1];
    if (!wave) return;
    
    this.spawnQueue = [];
    for (const group of wave.groups) {
      for (let i = 0; i < group.count; i++) {
        this.spawnQueue.push(group.type);
      }
    }
    this.waveActive = true;
    this.waveComplete = false;
    this.spawnTimer = this.spawnInterval; // Spawn first enemy immediately on start
  }

  update(dt, enemies) {
    if (!this.waveActive) return;
    if (this.spawnQueue.length === 0) return;

    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      const type = this.spawnQueue.shift();
      const enemyConfig = ENEMY_DATA[type];
      if (enemyConfig) {
        // Deep copy the path array to avoid reference issues
        const pathCopy = this.path.map(p => ({ x: p.x, y: p.y }));
        const enemy = new Enemy(enemyConfig, pathCopy);
        enemies.push(enemy);
      }
    }
  }

  isWaveComplete(enemies) {
    return this.spawnQueue.length === 0 && enemies.every(e => !e.alive || e.reachedEnd);
  }

  hasMoreWaves() {
    return this.currentWave < this.waveData.length;
  }
}
