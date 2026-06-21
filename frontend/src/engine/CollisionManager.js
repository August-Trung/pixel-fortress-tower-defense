export default class CollisionManager {
  checkBulletEnemyCollisions(bullets, enemies) {
    for (const bullet of bullets) {
      if (bullet.active && (!bullet.target || !bullet.target.alive)) {
        bullet.active = false;
      }
    }
  }
}
