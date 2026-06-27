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

  update(dt, enemies) {
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
      this.hit(enemies);
    } else {
      const moveAmount = this.speed * dt;
      this.x += (dx / dist) * Math.min(moveAmount, dist);
      this.y += (dy / dist) * Math.min(moveAmount, dist);
    }
  }

  hit(enemies) {
    if (this.type === 'cannon') {
      // Area-of-Effect Splash Damage
      const splashRadius = 60;
      if (enemies) {
        for (const enemy of enemies) {
          if (enemy.alive) {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d <= splashRadius) {
              enemy.takeDamage(this.damage);
            }
          }
        }
      }
    } else if (this.type === 'tesla') {
      // Chain Lightning
      if (this.target && this.target.alive) {
        this.target.takeDamage(this.damage);

        // Chain to up to 2 other nearby enemies
        const chains = 2;
        let currentSource = this.target;
        const chainRange = 80;
        const alreadyChained = new Set([currentSource.id]);

        if (enemies) {
          for (let c = 0; c < chains; c++) {
            let nextTarget = null;
            let minDist = Infinity;

            for (const enemy of enemies) {
              if (enemy.alive && !alreadyChained.has(enemy.id)) {
                const dx = enemy.x - currentSource.x;
                const dy = enemy.y - currentSource.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < chainRange && d < minDist) {
                  minDist = d;
                  nextTarget = enemy;
                }
              }
            }

            if (nextTarget) {
              nextTarget.takeDamage(this.damage * 0.7); // 70% chain damage
              alreadyChained.add(nextTarget.id);
              currentSource = nextTarget;
            } else {
              break;
            }
          }
        }
      }
    } else if (this.type === 'poison') {
      // Poison Dart (DoT)
      if (this.target && this.target.alive) {
        this.target.takeDamage(this.damage);
        this.target.applyPoison(4.0, 6.0); // 6 damage/sec for 4s
      }
    } else {
      // Standard hit (archer, mage, ice)
      if (this.target && this.target.alive) {
        this.target.takeDamage(this.damage);
        if (this.type === 'ice') {
          this.target.applySlow(2.0); // Slow duration = 2.0s
        }
      }
    }
    this.active = false;
  }
}
