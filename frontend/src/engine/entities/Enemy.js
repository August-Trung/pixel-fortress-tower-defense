const ICE_SLOW_FACTOR = 0.7; // ICE_SLOW_FACTOR = 0.7

export default class Enemy {
  constructor(config, path) {
    this.x = path[0].x;
    this.y = path[0].y;
    this.path = path;
    this.currentPathIndex = 0;
    this.speed = config.speed;
    this.baseSpeed = config.speed;
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.goldDrop = config.goldDrop;
    this.type = config.type;
    this.alive = true;
    this.reachedEnd = false;
    this.slowTimer = 0;
    this.poisonTimer = 0;
    this.poisonDamagePerSecond = 0;
    this.blockedBy = null;
  }

  update(dt) {
    if (!this.alive || this.reachedEnd) return;

    // Update slow effect
    let currentSpeed = this.baseSpeed;
    if (this.slowTimer > 0) {
      currentSpeed *= 0.7; // ICE_SLOW_FACTOR (0.7)
      this.slowTimer -= dt;
    }

    // Update poison DoT
    if (this.poisonTimer > 0) {
      this.takeDamage(this.poisonDamagePerSecond * dt);
      this.poisonTimer -= dt;
      if (this.poisonTimer <= 0) {
        this.poisonDamagePerSecond = 0;
      }
    }

    if (this.blockedBy && this.blockedBy.alive) {
      // Combat: deal damage to the blocker
      this.blockedBy.takeDamage(15 * dt); // 15 damage per second
    } else {
      this.blockedBy = null; // Clear dead/KO blocker

      const target = this.path[this.currentPathIndex];
      if (!target) {
        this.reachedEnd = true;
        return;
      }

      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 2) {
        this.currentPathIndex++;
        if (this.currentPathIndex >= this.path.length) {
          this.reachedEnd = true;
          return;
        }
      } else {
        // Scale speed: speed * 60 * dt
        const moveSpeed = currentSpeed * 60 * dt;
        this.x += (dx / dist) * Math.min(moveSpeed, dist);
        this.y += (dy / dist) * Math.min(moveSpeed, dist);
      }
    }
  }

  takeDamage(damage) {
    if (!this.alive) return;
    this.hp -= damage;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }

  applySlow(duration) {
    this.slowTimer = duration;
  }

  applyPoison(duration, damagePerSecond) {
    this.poisonTimer = duration;
    // Set DoT damage. If already poisoned, keep the highest damage rate
    this.poisonDamagePerSecond = Math.max(this.poisonDamagePerSecond, damagePerSecond);
  }
}
