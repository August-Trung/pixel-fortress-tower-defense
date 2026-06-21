const SPRITE_SOURCES = {
  grass: '/sprites/tiles/grass.png',
  path: '/sprites/tiles/path.png',
  grass_desert: '/sprites/tiles/grass_desert.png',
  path_desert: '/sprites/tiles/path_desert.png',
  grass_frozen: '/sprites/tiles/grass_frozen.png',
  path_frozen: '/sprites/tiles/path_frozen.png',
  castle: '/sprites/tiles/castle.png',
  tower_archer: '/sprites/towers/archer.png',
  tower_mage: '/sprites/towers/mage.png',
  tower_ice: '/sprites/towers/ice.png',
  tower_base: '/sprites/towers/base.png',
  tower_gun_archer: '/sprites/towers/gun_archer.png',
  tower_gun_mage: '/sprites/towers/gun_mage.png',
  tower_gun_ice: '/sprites/towers/gun_ice.png',
  enemy_skeleton: '/sprites/enemies/skeleton.png',
  enemy_wolf: '/sprites/enemies/wolf.png',
  enemy_orc: '/sprites/enemies/orc.png',
  enemy_dragon: '/sprites/enemies/dragon.png',
  bullet_archer: '/sprites/bullets/arrow.png',
  bullet_mage: '/sprites/bullets/fireball.png',
  bullet_ice: '/sprites/bullets/iceball.png',
  decor_flower_red: '/sprites/decorations/flower_red.png',
  decor_flower_yellow: '/sprites/decorations/flower_yellow.png',
  decor_stump: '/sprites/decorations/stump.png',
  decor_stone: '/sprites/decorations/stone.png',
  decor_cactus: '/sprites/decorations/cactus.png',
  decor_desert_stone: '/sprites/decorations/desert_stone.png',
  decor_crystal: '/sprites/decorations/crystal.png',
  decor_snow_stone: '/sprites/decorations/snow_stone.png',
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
