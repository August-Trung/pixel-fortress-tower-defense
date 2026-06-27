export default class Soldier {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.hp = 150;
    this.maxHp = 150;
    this.damage = 6;
    this.range = 24;
    this.fireRate = 1.2;
    this.fireCooldown = 0;
    this.alive = true;
    this.target = null;
  }

  update(dt, enemies) {
    if (!this.alive) return;

    if (this.fireCooldown > 0) {
      this.fireCooldown -= dt;
    }

    this.target = this.findTarget(enemies);
    if (this.target) {
      if (this.fireCooldown <= 0) {
        this.attack();
        this.fireCooldown = this.fireRate;
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
    }
  }
}
