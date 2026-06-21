import { MAP_ROWS, MAP_COLS, TILE_SIZE } from './data/mapData.js';
import { loadAllSprites } from './utils/spriteLoader.js';

export default class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
    this.sprites = {};
  }

  async loadSprites() {
    this.sprites = await loadAllSprites();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  drawMap(mapGrid) {
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const tile = mapGrid[row][col];
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE;

        if (tile === 0) {
          this.drawSprite('grass', x, y);
        } else if (tile === 1 || tile === 2) {
          this.drawSprite('path', x, y);
        } else if (tile === 3) {
          this.drawSprite('castle', x, y);
        }
      }
    }
  }

  drawTowers(towers) {
    for (const tower of towers) {
      const x = tower.gridX * TILE_SIZE;
      const y = tower.gridY * TILE_SIZE;
      this.drawSprite(`tower_${tower.type}`, x, y);

      // Draw Level text
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 10px monospace';
      this.ctx.shadowColor = 'black';
      this.ctx.shadowBlur = 4;
      this.ctx.fillText(`Lv${tower.level}`, x + 4, y + TILE_SIZE - 4);
      this.ctx.shadowBlur = 0; // reset shadow
    }
  }

  drawEnemies(enemies) {
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const x = enemy.x - TILE_SIZE / 2;
      const y = enemy.y - TILE_SIZE / 2;
      this.drawSprite(`enemy_${enemy.type}`, x, y);
    }
  }

  drawBullets(bullets) {
    for (const bullet of bullets) {
      if (!bullet.active) continue;
      const img = this.sprites[`bullet_${bullet.type}`];
      if (img) {
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.drawImage(img, bullet.x - 8, bullet.y - 8, 16, 16);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
        this.ctx.fillStyle = this.getBulletColor(bullet.type);
        this.ctx.fill();
        this.ctx.closePath();
      }
    }
  }

  drawHealthBars(enemies) {
    for (const enemy of enemies) {
      if (!enemy.alive || enemy.hp === enemy.maxHp) continue;
      const barWidth = 32;
      const barHeight = 4;
      const x = enemy.x - barWidth / 2;
      const y = enemy.y - TILE_SIZE / 2 - 8;

      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(x, y, barWidth, barHeight);

      const healthPercent = enemy.hp / enemy.maxHp;
      this.ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.2 ? '#FFC107' : '#F44336';
      this.ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
    }
  }

  drawTowerRanges(selectedTower) {
    if (!selectedTower) return;
    this.ctx.beginPath();
    this.ctx.arc(selectedTower.x, selectedTower.y, selectedTower.range, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0, 188, 212, 0.15)';
    this.ctx.fill();
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = 'rgba(0, 188, 212, 0.5)';
    this.ctx.stroke();
    this.ctx.closePath();
  }

  drawPlacementPreview(preview) {
    if (!preview) return;
    const x = preview.gridX * TILE_SIZE;
    const y = preview.gridY * TILE_SIZE;

    // Green shade if placeable, red shade if invalid
    this.ctx.fillStyle = preview.placeable ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)';
    this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    this.ctx.strokeStyle = preview.placeable ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.8)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

    // Draw range circle
    const centerX = x + TILE_SIZE / 2;
    const centerY = y + TILE_SIZE / 2;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, preview.range, 0, Math.PI * 2);
    this.ctx.fillStyle = preview.placeable ? 'rgba(76, 175, 80, 0.08)' : 'rgba(244, 67, 54, 0.08)';
    this.ctx.fill();
    this.ctx.strokeStyle = preview.placeable ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    this.ctx.closePath();
  }

  drawSprite(name, x, y) {
    const img = this.sprites[name];
    if (img) {
      this.ctx.imageSmoothingEnabled = false;
      this.ctx.drawImage(img, x, y, TILE_SIZE, TILE_SIZE);
    } else {
      this.ctx.fillStyle = this.getFallbackColor(name);
      this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    }
  }

  getBulletColor(type) {
    if (type === 'archer') return '#8B4513';
    if (type === 'mage') return '#FF9800';
    if (type === 'ice') return '#00E5FF';
    return '#FFFFFF';
  }

  getFallbackColor(name) {
    const colors = {
      grass: '#2E7D32', // Deep medieval forest green
      path: '#D7CCC8',  // Light dirt road
      castle: '#4E342E', // Brown stone fort
      tower_archer: '#8D6E63', // Archer brown
      tower_mage: '#7E57C2',   // Mage purple
      tower_ice: '#29B6F6',    // Ice blue
      enemy_skeleton: '#ECEFF1', // Skeleton white-gray
      enemy_wolf: '#757575',     // Wolf dark gray
      enemy_orc: '#558B2F',      // Orc army green
      enemy_dragon: '#C62828',   // Boss dragon deep red
    };
    for (const [key, color] of Object.entries(colors)) {
      if (name.includes(key)) return color;
    }
    return '#FF00FF';
  }
}
