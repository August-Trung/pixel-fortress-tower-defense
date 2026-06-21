export default class VfxManager {
  constructor() {
    this.particles = [];
    this.texts = [];
  }

  spawnSparks(x, y, color = '#FFD54F', count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 50;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color,
        size: 2 + Math.random() * 3,
        life: 0.3 + Math.random() * 0.2, // seconds
        maxLife: 0.5
      });
    }
  }

  spawnFloatingText(x, y, text, color = '#FFD54F') {
    this.texts.push({
      x: x,
      y: y - 10, // spawn slightly above entity
      text: text,
      color: color,
      vy: -40, // float upwards at 40px/s
      life: 1.0, // 1 second duration
      maxLife: 1.0
    });
  }

  update(dt) {
    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update text indicators
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.y += t.vy * dt;
      t.life -= dt;
      if (t.life <= 0) {
        this.texts.splice(i, 1);
      }
    }
  }

  clear() {
    this.particles = [];
    this.texts = [];
  }
}
