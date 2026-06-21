export default class Bullet {
  constructor({ x, y, target, damage, speed, type }) {
    this.x = x;
    this.y = y;
    this.target = target;
    this.damage = damage;
    this.speed = speed; // e.g. 300px/s
    this.type = type;
    this.active = true;
  }

  update(dt) {
    if (!this.active) return;
    if (!this.target || !this.target.alive) {
      this.active = false;
      return;
    }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // BULLET_HIT_RADIUS = 8
    if (dist < 8) {
      this.hit();
    } else {
      const moveAmount = this.speed * dt;
      this.x += (dx / dist) * Math.min(moveAmount, dist);
      this.y += (dy / dist) * Math.min(moveAmount, dist);
    }
  }

  hit() {
    if (this.target && this.target.alive) {
      this.target.takeDamage(this.damage);
      if (this.type === 'ice') {
        this.target.applySlow(2.0); // ICE_SLOW_DURATION = 2.0s
      }
    }
    this.active = false;
  }
}
