const SPRITE_SOURCES = {
  grass: '/sprites/tiles/grass.png',
  path: '/sprites/tiles/path.png',
  castle: '/sprites/tiles/castle.png',
  tower_archer: '/sprites/towers/archer.png',
  tower_mage: '/sprites/towers/mage.png',
  tower_ice: '/sprites/towers/ice.png',
  enemy_skeleton: '/sprites/enemies/skeleton.png',
  enemy_wolf: '/sprites/enemies/wolf.png',
  enemy_orc: '/sprites/enemies/orc.png',
  enemy_dragon: '/sprites/enemies/dragon.png',
  bullet_archer: '/sprites/bullets/arrow.png',
  bullet_mage: '/sprites/bullets/fireball.png',
  bullet_ice: '/sprites/bullets/iceball.png',
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
