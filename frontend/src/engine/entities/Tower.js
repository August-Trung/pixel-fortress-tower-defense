import { TILE_SIZE } from '../data/mapData.js';
import { distance } from '../utils/math.js';
import Bullet from './Bullet.js';

export default class Tower {
  constructor(config, gridX, gridY) {
    this.id = Tower.nextId++;
    this.x = gridX * TILE_SIZE + TILE_SIZE / 2;
    this.y = gridY * TILE_SIZE + TILE_SIZE / 2;
    this.gridX = gridX;
    this.gridY = gridY;
    this.type = config.type;
    this.name = config.name;
    this.level = 1;
    this.damage = config.damage;
    this.range = config.range;
    this.fireRate = config.fireRate;
    this.fireCooldown = 0;
    this.cost = config.cost;
    this.totalInvested = config.cost;
    this.target = null;
  }

  update(dt, enemies, bullets) {
    if (this.fireCooldown > 0) {
      this.fireCooldown -= dt;
    }
    this.target = this.findTarget(enemies);
    if (this.target && this.fireCooldown <= 0) {
      this.shoot(bullets);
      this.fireCooldown = this.fireRate;
    }
  }

  findTarget(enemies) {
    let bestTarget = null;
    let bestProgress = -1;
    let shortestDistanceToExit = Infinity; // To break ties, prioritize enemies closer to destination

    for (const enemy of enemies) {
      if (!enemy.alive || enemy.reachedEnd) continue;
      const dist = distance(this.x, this.y, enemy.x, enemy.y);
      if (dist <= this.range) {
        // Prioritize enemy furthest along the path (highest waypoint index)
        if (enemy.currentPathIndex > bestProgress) {
          bestProgress = enemy.currentPathIndex;
          bestTarget = enemy;
        } else if (enemy.currentPathIndex === bestProgress) {
          // If they are on the same path segment, prioritize the one closest to the next waypoint
          if (bestTarget) {
            const nextWaypoint = enemy.path[enemy.currentPathIndex];
            const distEnemy = distance(enemy.x, enemy.y, nextWaypoint.x, nextWaypoint.y);
            const distBest = distance(bestTarget.x, bestTarget.y, nextWaypoint.x, nextWaypoint.y);
            if (distEnemy < distBest) {
              bestTarget = enemy;
            }
          } else {
            bestTarget = enemy;
          }
        }
      }
    }
    return bestTarget;
  }

  shoot(bullets) {
    const bullet = new Bullet({
      x: this.x,
      y: this.y,
      target: this.target,
      damage: this.damage,
      speed: 300, // 300px/s
      type: this.type,
    });
    bullets.push(bullet);
  }

  upgrade(upgradeConfig) {
    this.level++;
    this.damage = upgradeConfig.damage;
    this.range = upgradeConfig.range;
    this.fireRate = upgradeConfig.fireRate;
    this.totalInvested += upgradeConfig.cost;
  }

  getSellPrice() {
    return Math.floor(this.totalInvested * 0.5);
  }
}

Tower.nextId = 1;
