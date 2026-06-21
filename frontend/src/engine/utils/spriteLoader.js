const SPRITE_SOURCES = {
  grass: '/src/assets/sprites/tiles/grass.png',
  path: '/src/assets/sprites/tiles/path.png',
  castle: '/src/assets/sprites/tiles/castle.png',
  tower_archer: '/src/assets/sprites/towers/archer.png',
  tower_mage: '/src/assets/sprites/towers/mage.png',
  tower_ice: '/src/assets/sprites/towers/ice.png',
  enemy_skeleton: '/src/assets/sprites/enemies/skeleton.png',
  enemy_wolf: '/src/assets/sprites/enemies/wolf.png',
  enemy_orc: '/src/assets/sprites/enemies/orc.png',
  enemy_dragon: '/src/assets/sprites/enemies/dragon.png',
  bullet_archer: '/src/assets/sprites/bullets/arrow.png',
  bullet_mage: '/src/assets/sprites/bullets/fireball.png',
  bullet_ice: '/src/assets/sprites/bullets/iceball.png',
};

export async function loadAllSprites() {
  const sprites = {};
  const promises = Object.entries(SPRITE_SOURCES).map(([key, src]) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        sprites[key] = img;
        resolve();
      };
      img.onerror = () => {
        console.warn(`Failed to load sprite: ${key} from ${src}. Will use fallback color.`);
        sprites[key] = null;
        resolve();
      };
    });
  });

  await Promise.all(promises);
  return sprites;
}
