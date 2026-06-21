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

  drawMap(mapGrid, theme = 'grasslands') {
    const isDesert = theme === 'desert';
    const isFrozen = theme === 'frozen';
    const grassSprite = isDesert ? 'grass_desert' : isFrozen ? 'grass_frozen' : 'grass';
    const pathSprite = isDesert ? 'path_desert' : isFrozen ? 'path_frozen' : 'path';

    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const tile = mapGrid[row][col];
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE;

        if (tile === 0) {
          this.drawSprite(grassSprite, x, y);
          
          // Draw deterministic decorations on grass/sand/snow (density ~15%)
          const seed = (col * 17 + row * 31) % 100;
          if (seed < 15) {
            this.drawDecoration(theme, seed, x, y);
          }
        } else if (tile === 1 || tile === 2) {
          this.drawSprite(pathSprite, x, y);
          
          // Draw path gravel edges for production polish
          this.drawPathBorders(mapGrid, col, row, x, y, theme);
        } else if (tile === 3) {
          this.drawSprite('castle', x, y);
        }
      }
    }
  }

  drawDecoration(theme, seed, x, y) {
    let spriteName = null;
    let width = TILE_SIZE * 0.7;
    let height = TILE_SIZE * 0.7;
    
    if (theme === 'grasslands') {
      if (seed < 2) {
        spriteName = 'decor_tree_green';
        width = TILE_SIZE;
        height = TILE_SIZE * 1.4;
      } else if (seed < 4) {
        spriteName = 'decor_tree_pine';
        width = TILE_SIZE;
        height = TILE_SIZE * 1.4;
      } else if (seed < 6) {
        spriteName = 'decor_rock_large';
        width = TILE_SIZE * 0.95;
        height = TILE_SIZE * 0.95;
      } else if (seed < 8) {
        spriteName = 'decor_rock_medium';
        width = TILE_SIZE * 0.8;
        height = TILE_SIZE * 0.8;
      } else if (seed < 10) {
        spriteName = 'decor_flower_red';
      } else if (seed < 12) {
        spriteName = 'decor_flower_yellow';
      } else if (seed < 13) {
        spriteName = 'decor_stump';
      } else {
        spriteName = 'decor_stone';
      }
    } else if (theme === 'desert') {
      if (seed < 4) {
        spriteName = 'decor_cactus';
        width = TILE_SIZE * 0.85;
        height = TILE_SIZE * 1.1;
      } else if (seed < 7) {
        spriteName = 'decor_rock_large';
        width = TILE_SIZE * 0.9;
        height = TILE_SIZE * 0.9;
      } else if (seed < 11) {
        spriteName = 'decor_desert_stone';
      } else {
        spriteName = 'decor_rock_medium';
        width = TILE_SIZE * 0.8;
        height = TILE_SIZE * 0.8;
      }
    } else if (theme === 'frozen') {
      if (seed < 3) {
        spriteName = 'decor_tree_pine';
        width = TILE_SIZE;
        height = TILE_SIZE * 1.4;
      } else if (seed < 6) {
        spriteName = 'decor_crystal';
      } else if (seed < 9) {
        spriteName = 'decor_rock_large';
        width = TILE_SIZE * 0.9;
        height = TILE_SIZE * 0.9;
      } else if (seed < 12) {
        spriteName = 'decor_snow_stone';
      } else {
        spriteName = 'decor_rock_medium';
        width = TILE_SIZE * 0.8;
        height = TILE_SIZE * 0.8;
      }
    }

    if (spriteName) {
      const img = this.sprites[spriteName];
      if (img) {
        this.ctx.imageSmoothingEnabled = false;
        const xOffset = (TILE_SIZE - width) / 2;
        const yOffset = TILE_SIZE - height;
        this.ctx.drawImage(img, x + xOffset, y + yOffset, width, height);
      }
    }
  }

  drawJaggedEdge(x1, y1, x2, y2, normalX, normalY, numSpikes, seedOffset, fillColor, strokeColor) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / len;
    const uy = dy / len;
    const spikeHeight = 3.5; // Shorter spike height for cleaner, wider path visibility
    
    this.ctx.fillStyle = fillColor;
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = 1.5;
    
    // 1. Fill the jagged path area extending from the straight tile boundary line
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    for (let i = 0; i < numSpikes; i++) {
      const tMid = (i + 0.5) / numSpikes;
      const tEnd = (i + 1) / numSpikes;
      const seed = (seedOffset + i * 17) % 5;
      const h = spikeHeight + seed - 2; // variations from 1.5 to 5.5px
      const pxMid = x1 + ux * (tMid * len) + normalX * h;
      const pyMid = y1 + uy * (tMid * len) + normalY * h;
      const pxEnd = x1 + ux * (tEnd * len);
      const pyEnd = y1 + uy * (tEnd * len);
      this.ctx.lineTo(pxMid, pyMid);
      this.ctx.lineTo(pxEnd, pyEnd);
    }
    this.ctx.closePath();
    this.ctx.fill();
    
    // 2. Stroke ONLY the jagged boundary line for rich pixel aesthetic
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    for (let i = 0; i < numSpikes; i++) {
      const tMid = (i + 0.5) / numSpikes;
      const tEnd = (i + 1) / numSpikes;
      const seed = (seedOffset + i * 17) % 5;
      const h = spikeHeight + seed - 2;
      const pxMid = x1 + ux * (tMid * len) + normalX * h;
      const pyMid = y1 + uy * (tMid * len) + normalY * h;
      const pxEnd = x1 + ux * (tEnd * len);
      const pyEnd = y1 + uy * (tEnd * len);
      this.ctx.lineTo(pxMid, pyMid);
      this.ctx.lineTo(pxEnd, pyEnd);
    }
    this.ctx.stroke();
  }

  drawPathBorders(mapGrid, col, row, x, y, theme) {
    let fillColor = '#2E7D32'; // grass green
    let strokeColor = '#1B5E20'; // dark green border for grasslands
    
    if (theme === 'desert') {
      fillColor = '#E2C280'; // desert sand
      strokeColor = '#5D4037'; // dark brown border for desert
    } else if (theme === 'frozen') {
      fillColor = '#E3F2FD'; // snow white-blue
      strokeColor = '#37474F'; // dark grey-blue border for frozen
    }
    
    const numSpikes = 6;
    
    // Top border (grass above, spikes point down)
    if (row > 0 && mapGrid[row - 1][col] === 0) {
      this.drawJaggedEdge(x, y, x + TILE_SIZE, y, 0, 1, numSpikes, col * 7 + row * 13, fillColor, strokeColor);
    }
    // Bottom border (grass below, spikes point up)
    if (row < MAP_ROWS - 1 && mapGrid[row + 1][col] === 0) {
      this.drawJaggedEdge(x, y + TILE_SIZE, x + TILE_SIZE, y + TILE_SIZE, 0, -1, numSpikes, col * 11 + row * 7, fillColor, strokeColor);
    }
    // Left border (grass to left, spikes point right)
    if (col > 0 && mapGrid[row][col - 1] === 0) {
      this.drawJaggedEdge(x, y, x, y + TILE_SIZE, 1, 0, numSpikes, col * 13 + row * 17, fillColor, strokeColor);
    }
    // Right border (grass to right, spikes point left)
    if (col < MAP_COLS - 1 && mapGrid[row][col + 1] === 0) {
      this.drawJaggedEdge(x + TILE_SIZE, y, x + TILE_SIZE, y + TILE_SIZE, -1, 0, numSpikes, col * 17 + row * 11, fillColor, strokeColor);
    }
  }

  drawTowers(towers) {
    for (const tower of towers) {
      const x = tower.gridX * TILE_SIZE;
      const y = tower.gridY * TILE_SIZE;
      
      // Draw static base
      const baseImg = this.sprites['tower_base'];
      if (baseImg) {
        this.ctx.drawImage(baseImg, x, y, TILE_SIZE, TILE_SIZE);
      }

      // Draw rotating barrel
      const barrelImg = this.sprites[`tower_gun_${tower.type}`];
      if (barrelImg) {
        this.ctx.save();
        this.ctx.translate(x + TILE_SIZE / 2, y + TILE_SIZE / 2);
        this.ctx.rotate(tower.angle);
        this.ctx.drawImage(barrelImg, -TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
        this.ctx.restore();
      } else {
        this.drawSprite(`tower_${tower.type}`, x, y);
      }

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
    const time = performance.now() * 0.005;
    for (const enemy of enemies) {
      if (!enemy.alive) continue;

      this.ctx.save();
      // Translate to enemy's center for proper rotation/scaling
      this.ctx.translate(enemy.x, enemy.y);

      let wobbleAngle = 0;
      let bobY = 0;
      let scaleX = 1;
      let scaleY = 1;

      // Adjust wobble frequencies and amplitudes based on enemy speed/type
      const speedFactor = (enemy.speed / 1.5) || 1.0;
      const walkCycle = time * speedFactor * 2.0;

      if (enemy.type === 'dragon') {
        // Smooth flying bobbing movement
        bobY = Math.sin(walkCycle) * 3;
        wobbleAngle = Math.cos(walkCycle) * 0.05;
      } else if (enemy.type === 'wolf') {
        // Fast runner squash/stretch wobble
        wobbleAngle = Math.sin(walkCycle * 1.5) * 0.12;
        bobY = Math.abs(Math.sin(walkCycle * 1.5)) * -2;
        scaleX = 1.05 + Math.sin(walkCycle * 1.5) * 0.05;
      } else if (enemy.type === 'orc') {
        // Heavy, lumbering step
        wobbleAngle = Math.sin(walkCycle * 0.8) * 0.08;
        bobY = Math.abs(Math.sin(walkCycle * 0.8)) * -1.5;
        scaleY = 1.0 + Math.sin(walkCycle * 0.8) * 0.05;
      } else {
        // Skeleton or default walk bob
        wobbleAngle = Math.sin(walkCycle) * 0.1;
        bobY = Math.abs(Math.sin(walkCycle)) * -2;
      }

      this.ctx.rotate(wobbleAngle);
      this.ctx.scale(scaleX, scaleY);
      this.ctx.translate(0, bobY);

      // Draw the sprite centered at (0, 0)
      this.drawSprite(`enemy_${enemy.type}`, -TILE_SIZE / 2, -TILE_SIZE / 2);

      // Render blue freeze overlay if slowed (still centered)
      if (enemy.slowTimer > 0) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.4;
        this.ctx.fillStyle = '#00E5FF';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, TILE_SIZE / 2.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }

      this.ctx.restore();
    }
  }

  drawVfx(particles, texts) {
    // 1. Draw particles
    for (const p of particles) {
      this.ctx.save();
      this.ctx.globalAlpha = p.life / p.maxLife;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // 2. Draw floating text indicators
    for (const t of texts) {
      this.ctx.save();
      this.ctx.globalAlpha = t.life / t.maxLife;
      this.ctx.fillStyle = t.color;
      // Retro Press Start 2P font
      this.ctx.font = 'bold 8px "Courier New", Courier, monospace';
      this.ctx.shadowColor = 'black';
      this.ctx.shadowBlur = 4;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(t.text, t.x, t.y);
      this.ctx.restore();
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

