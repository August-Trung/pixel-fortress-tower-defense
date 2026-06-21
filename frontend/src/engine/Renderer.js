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
      return;
    }

    // Procedural Fallbacks (Pixel Art Procedural styles)
    if (name === 'grass') {
      this.drawProceduralGrass(x, y);
    } else if (name === 'path') {
      this.drawProceduralPath(x, y);
    } else if (name === 'castle') {
      this.drawProceduralCastle(x, y);
    } else if (name.includes('tower_archer')) {
      this.drawProceduralArcherTower(x, y);
    } else if (name.includes('tower_mage')) {
      this.drawProceduralMageTower(x, y);
    } else if (name.includes('tower_ice')) {
      this.drawProceduralIceTower(x, y);
    } else if (name.includes('enemy_skeleton')) {
      this.drawProceduralSkeleton(x, y);
    } else if (name.includes('enemy_wolf')) {
      this.drawProceduralWolf(x, y);
    } else if (name.includes('enemy_orc')) {
      this.drawProceduralOrc(x, y);
    } else if (name.includes('enemy_dragon')) {
      this.drawProceduralDragon(x, y);
    } else {
      this.ctx.fillStyle = this.getFallbackColor(name);
      this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    }
  }

  // --- Procedural Canvas Pixel Art Renderers ---

  drawProceduralGrass(x, y) {
    // Green base
    this.ctx.fillStyle = '#2E7D32';
    this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Subtle dark border grid to feel like tiles
    this.ctx.strokeStyle = '#276A2B';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

    // Dynamic grass details based on coordinates (deterministic seed)
    const seed = (x * 7 + y * 13) % 100;
    this.ctx.fillStyle = '#4CAF50';
    if (seed < 30) {
      // Grass blades
      this.ctx.fillRect(x + 10, y + 15, 2, 4);
      this.ctx.fillRect(x + 12, y + 13, 2, 6);
      this.ctx.fillRect(x + 30, y + 32, 2, 5);
    } else if (seed < 60) {
      this.ctx.fillRect(x + 24, y + 20, 2, 5);
      this.ctx.fillRect(x + 26, y + 22, 2, 3);
      this.ctx.fillRect(x + 8, y + 35, 2, 4);
    } else if (seed < 75) {
      // Tiny medieval yellow flower
      this.ctx.fillStyle = '#FFF9C4';
      this.ctx.fillRect(x + 16, y + 16, 3, 3);
      this.ctx.fillStyle = '#FBC02D';
      this.ctx.fillRect(x + 17, y + 17, 1, 1);
    }
  }

  drawProceduralPath(x, y) {
    // Dirt road beige base
    this.ctx.fillStyle = '#D7CCC8';
    this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Draw stone borders or spots
    const seed = (x * 9 + y * 17) % 100;
    this.ctx.fillStyle = '#BCAAA4';
    if (seed < 35) {
      this.ctx.fillRect(x + 6, y + 12, 4, 3);
      this.ctx.fillRect(x + 28, y + 24, 3, 3);
    } else if (seed < 70) {
      this.ctx.fillRect(x + 16, y + 32, 4, 4);
      this.ctx.fillRect(x + 32, y + 8, 3, 3);
    }
    
    // Path gravel/edges
    this.ctx.fillStyle = '#8D6E63';
    if (x % 96 === 0) {
      this.ctx.fillRect(x, y, 2, TILE_SIZE);
    }
    if (y % 96 === 0) {
      this.ctx.fillRect(x, y, TILE_SIZE, 2);
    }
  }

  drawProceduralCastle(x, y) {
    // Dark brown/gray stone fort
    this.ctx.fillStyle = '#4E342E';
    this.ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

    // Castle bricks
    this.ctx.fillStyle = '#3E2723';
    this.ctx.fillRect(x, y, TILE_SIZE, 6);
    this.ctx.fillRect(x + 6, y + 12, 14, 6);
    this.ctx.fillRect(x + 26, y + 12, 16, 6);
    this.ctx.fillRect(x + 12, y + 24, 24, 6);

    // Castle gate/doorway arch
    this.ctx.fillStyle = '#1A0C00';
    this.ctx.fillRect(x + 10, y + 30, 28, 18);
  }

  drawProceduralArcherTower(x, y) {
    // Wooden structural posts
    this.ctx.fillStyle = '#5D4037';
    this.ctx.fillRect(x + 10, y + 14, 6, 34);
    this.ctx.fillRect(x + 32, y + 14, 6, 34);

    // Cross braces
    this.ctx.strokeStyle = '#5D4037';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(x + 12, y + 16);
    this.ctx.lineTo(x + 36, y + 44);
    this.ctx.moveTo(x + 36, y + 16);
    this.ctx.lineTo(x + 12, y + 44);
    this.ctx.stroke();
    this.ctx.closePath();

    // Wood platform deck
    this.ctx.fillStyle = '#8D6E63';
    this.ctx.fillRect(x + 6, y + 8, 36, 6);

    // Red defensive roof
    this.ctx.fillStyle = '#C62828';
    this.ctx.beginPath();
    this.ctx.moveTo(x + 4, y + 8);
    this.ctx.lineTo(x + 24, y);
    this.ctx.lineTo(x + 44, y + 8);
    this.ctx.fill();
    this.ctx.closePath();

    // Archer insignia sign
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px Courier';
    this.ctx.fillText('🏹', x + 16, y + 24);
  }

  drawProceduralMageTower(x, y) {
    // Obsidian purple brick tower
    this.ctx.fillStyle = '#4A148C';
    this.ctx.fillRect(x + 8, y + 12, 32, 36);

    // Golden runic bands
    this.ctx.fillStyle = '#FFD54F';
    this.ctx.fillRect(x + 6, y + 10, 36, 3);
    this.ctx.fillRect(x + 6, y + 34, 36, 3);

    // Glowing sorcerer crystal ball on top
    this.ctx.beginPath();
    this.ctx.arc(x + 24, y + 6, 6, 0, Math.PI * 2);
    this.ctx.fillStyle = '#EA80FC';
    // Shadows crystal glow
    this.ctx.shadowColor = '#EA80FC';
    this.ctx.shadowBlur = 8;
    this.ctx.fill();
    this.ctx.shadowBlur = 0; // reset
    this.ctx.closePath();

    // Mage sign
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px Courier';
    this.ctx.fillText('🔮', x + 16, y + 26);
  }

  drawProceduralIceTower(x, y) {
    // Frozen cyan obelisk core
    this.ctx.fillStyle = '#00838F';
    this.ctx.fillRect(x + 10, y + 14, 28, 34);

    // Ice crystal crown peak
    this.ctx.fillStyle = '#00E5FF';
    this.ctx.beginPath();
    this.ctx.moveTo(x + 10, y + 14);
    this.ctx.lineTo(x + 24, y + 2);
    this.ctx.lineTo(x + 38, y + 14);
    this.ctx.fill();
    this.ctx.closePath();

    // Glowing core frost crystal
    this.ctx.fillStyle = '#E0F7FA';
    this.ctx.fillRect(x + 16, y + 20, 16, 16);

    // Ice sign
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px Courier';
    this.ctx.fillText('❄️', x + 16, y + 30);
  }

  drawProceduralSkeleton(x, y) {
    // White skull body
    this.ctx.fillStyle = '#ECEFF1';
    this.ctx.fillRect(x + 14, y + 10, 20, 18);
    this.ctx.fillRect(x + 18, y + 28, 12, 6); // jaw

    // Hollow eye sockets
    this.ctx.fillStyle = '#1A1A1A';
    this.ctx.fillRect(x + 17, y + 16, 4, 4);
    this.ctx.fillRect(x + 27, y + 16, 4, 4);

    // Glowing evil red pupils
    this.ctx.fillStyle = '#FF1744';
    this.ctx.fillRect(x + 18, y + 17, 2, 2);
    this.ctx.fillRect(x + 28, y + 17, 2, 2);
  }

  drawProceduralWolf(x, y) {
    // Dark grey wolf body
    this.ctx.fillStyle = '#546E7A';
    this.ctx.fillRect(x + 8, y + 12, 32, 24);

    // Spiky ears
    this.ctx.beginPath();
    this.ctx.moveTo(x + 8, y + 12);
    this.ctx.lineTo(x + 13, y + 2);
    this.ctx.lineTo(x + 18, y + 12);
    this.ctx.moveTo(x + 30, y + 12);
    this.ctx.lineTo(x + 35, y + 2);
    this.ctx.lineTo(x + 40, y + 12);
    this.ctx.fill();
    this.ctx.closePath();

    // Snout
    this.ctx.fillStyle = '#263238';
    this.ctx.fillRect(x + 18, y + 22, 12, 8);

    // Glowing yellow eyes
    this.ctx.fillStyle = '#FFEE58';
    this.ctx.fillRect(x + 12, y + 16, 3, 2);
    this.ctx.fillRect(x + 32, y + 16, 3, 2);
  }

  drawProceduralOrc(x, y) {
    // Green massive body
    this.ctx.fillStyle = '#2E7D32';
    this.ctx.fillRect(x + 6, y + 10, 36, 28);

    // Iron helmet plate
    this.ctx.fillStyle = '#78909C';
    this.ctx.fillRect(x + 4, y + 4, 40, 8);
    this.ctx.fillRect(x + 22, y, 4, 4); // spike

    // Angry red eyes
    this.ctx.fillStyle = '#C62828';
    this.ctx.fillRect(x + 12, y + 16, 4, 3);
    this.ctx.fillRect(x + 32, y + 16, 4, 3);

    // Fangs showing at bottom mouth
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(x + 14, y + 28, 2, 4);
    this.ctx.fillRect(x + 32, y + 28, 2, 4);
  }

  drawProceduralDragon(x, y) {
    // Red scale dragon body
    this.ctx.fillStyle = '#C62828';
    this.ctx.fillRect(x + 4, y + 4, 40, 40);

    // Sharp yellow horns
    this.ctx.fillStyle = '#FFB300';
    this.ctx.beginPath();
    this.ctx.moveTo(x + 8, y + 4);
    this.ctx.lineTo(x + 2, y - 6);
    this.ctx.lineTo(x + 14, y + 4);
    this.ctx.moveTo(x + 32, y + 4);
    this.ctx.lineTo(x + 38, y - 6);
    this.ctx.lineTo(x + 40, y + 4);
    this.ctx.fill();
    this.ctx.closePath();

    // Dark purple dragon wings
    this.ctx.fillStyle = '#4A148C';
    this.ctx.fillRect(x - 6, y + 14, 10, 18);
    this.ctx.fillRect(x + 44, y + 14, 10, 18);

    // Fiery yellow eyes with cat-like slit pupil
    this.ctx.fillStyle = '#FFEB3B';
    this.ctx.fillRect(x + 10, y + 16, 6, 6);
    this.ctx.fillRect(x + 32, y + 16, 6, 6);
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(x + 12, y + 16, 2, 6);
    this.ctx.fillRect(x + 34, y + 16, 2, 6);
  }

  getBulletColor(type) {
    if (type === 'archer') return '#8B4513';
    if (type === 'mage') return '#FF9800';
    if (type === 'ice') return '#00E5FF';
    return '#FFFFFF';
  }

  getFallbackColor(name) {
    const colors = {
      grass: '#2E7D32',
      path: '#D7CCC8',
      castle: '#4E342E',
      tower_archer: '#8D6E63',
      tower_mage: '#7E57C2',
      tower_ice: '#29B6F6',
      enemy_skeleton: '#ECEFF1',
      enemy_wolf: '#757575',
      enemy_orc: '#558B2F',
      enemy_dragon: '#C62828',
    };
    for (const [key, color] of Object.entries(colors)) {
      if (name.includes(key)) return color;
    }
    return '#FF00FF';
  }
}

