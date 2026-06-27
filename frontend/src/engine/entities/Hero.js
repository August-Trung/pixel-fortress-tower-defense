export default class Hero {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.level = 1;
    this.xp = 0;
    this.xpNeeded = 100;
    this.hp = 300;
    this.maxHp = 300;
    this.damage = 25;
    this.range = 90;
    this.fireRate = 1.0;
    this.fireCooldown = 0;
    this.alive = true;
    this.koTimer = 0;
    this.angle = 0;
    this.target = null;
  }

  update(dt, enemies) {
    if (!this.alive) {
      this.koTimer -= dt;
      if (this.koTimer <= 0) {
        this.alive = true;
        this.hp = this.maxHp;
      }
      return;
    }

    if (this.fireCooldown > 0) {
      this.fireCooldown -= dt;
    }

    // Move towards target coordinates
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 4) {
      const speed = 120 * dt; // 120 pixels per second
      this.x += (dx / dist) * Math.min(speed, dist);
      this.y += (dy / dist) * Math.min(speed, dist);
      this.angle = Math.atan2(dy, dx);
    } else {
      // Look for enemies to attack
      this.target = this.findTarget(enemies);
      if (this.target) {
        const adx = this.target.x - this.x;
        const ady = this.target.y - this.y;
        this.angle = Math.atan2(ady, adx);

        if (this.fireCooldown <= 0) {
          this.attack();
          this.fireCooldown = this.fireRate;
        }
      }
    }
  }

  findTarget(enemies) {
    let bestTarget = null;
    let minDist = this.range;
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const d = Math.sqrt((enemy.x - this.x) ** 2 + (enemy.y - this.y) ** 2);
      if (d < minDist) {
        minDist = d;
        bestTarget = enemy;
      }
    }
    return bestTarget;
  }

  attack() {
    if (this.target && this.target.alive) {
      this.target.takeDamage(this.damage);
    }
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      this.koTimer = 12; // KO'ed for 12 seconds
      this.targetX = this.x;
      this.targetY = this.y;
    }
  }

  gainXp(amount) {
    if (!this.alive) return;
    this.xp += amount;
    if (this.xp >= this.xpNeeded) {
      this.xp -= this.xpNeeded;
      this.level++;
      this.xpNeeded = Math.floor(this.xpNeeded * 1.5);
      this.maxHp = Math.floor(this.maxHp * 1.25);
      this.hp = this.maxHp;
      this.damage = Math.floor(this.damage * 1.2);
    }
  }
}
