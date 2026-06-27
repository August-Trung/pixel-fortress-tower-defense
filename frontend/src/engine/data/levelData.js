import { TILE_SIZE } from './mapData.js';

// Base map layout templates
const MAP_TEMPLATES = [
  // Template 0 (Whispering Grasslands style)
  {
    mapGrid: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [2, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 3],
    ],
    pathWaypoints: [
      { x: 0,                                 y: 2 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 7 * TILE_SIZE + TILE_SIZE / 2,     y: 2 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 7 * TILE_SIZE + TILE_SIZE / 2,     y: 5 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 13 * TILE_SIZE + TILE_SIZE / 2,    y: 5 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 13 * TILE_SIZE + TILE_SIZE / 2,    y: 2 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 17 * TILE_SIZE + TILE_SIZE / 2,    y: 2 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 17 * TILE_SIZE + TILE_SIZE / 2,    y: 9 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 11 * TILE_SIZE + TILE_SIZE / 2,    y: 9 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 11 * TILE_SIZE + TILE_SIZE / 2,    y: 11 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 20 * TILE_SIZE,                    y: 11 * TILE_SIZE + TILE_SIZE / 2 },
    ]
  },
  // Template 1 (Desert Oasis double-loop style)
  {
    mapGrid: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3],
    ],
    pathWaypoints: [
      { x: 2 * TILE_SIZE + TILE_SIZE / 2,    y: 12 * TILE_SIZE },
      { x: 2 * TILE_SIZE + TILE_SIZE / 2,    y: 2 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 6 * TILE_SIZE + TILE_SIZE / 2,    y: 2 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 6 * TILE_SIZE + TILE_SIZE / 2,    y: 8 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 10 * TILE_SIZE + TILE_SIZE / 2,   y: 8 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 10 * TILE_SIZE + TILE_SIZE / 2,   y: 2 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 16 * TILE_SIZE + TILE_SIZE / 2,   y: 2 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 16 * TILE_SIZE + TILE_SIZE / 2,   y: 11 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 20 * TILE_SIZE,                   y: 11 * TILE_SIZE + TILE_SIZE / 2 }
    ]
  },
  // Template 2 (Frozen serpentine style)
  {
    mapGrid: [
      [0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 3],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    pathWaypoints: [
      { x: 5 * TILE_SIZE + TILE_SIZE / 2,    y: 0 },
      { x: 5 * TILE_SIZE + TILE_SIZE / 2,    y: 9 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 10 * TILE_SIZE + TILE_SIZE / 2,   y: 9 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 10 * TILE_SIZE + TILE_SIZE / 2,   y: 2 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 15 * TILE_SIZE + TILE_SIZE / 2,   y: 2 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 15 * TILE_SIZE + TILE_SIZE / 2,   y: 9 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 20 * TILE_SIZE,                   y: 9 * TILE_SIZE + TILE_SIZE / 2 }
    ]
  },
  // Template 3 (Z-shape path)
  {
    mapGrid: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3],
    ],
    pathWaypoints: [
      { x: 0,                               y: 2 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 17 * TILE_SIZE + TILE_SIZE / 2,  y: 2 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 17 * TILE_SIZE + TILE_SIZE / 2,  y: 5 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 2 * TILE_SIZE + TILE_SIZE / 2,   y: 5 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 2 * TILE_SIZE + TILE_SIZE / 2,   y: 8 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 17 * TILE_SIZE + TILE_SIZE / 2,  y: 8 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 17 * TILE_SIZE + TILE_SIZE / 2,  y: 11 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 20 * TILE_SIZE,                  y: 11 * TILE_SIZE + TILE_SIZE / 2 }
    ]
  },
  // Template 4 (Spiral Maze)
  {
    mapGrid: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      [0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      [0, 1, 0, 1, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      [0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    pathWaypoints: [
      { x: 0,                               y: 1 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 18 * TILE_SIZE + TILE_SIZE / 2,  y: 1 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 18 * TILE_SIZE + TILE_SIZE / 2,  y: 10 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 1 * TILE_SIZE + TILE_SIZE / 2,   y: 10 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 1 * TILE_SIZE + TILE_SIZE / 2,   y: 3 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 14 * TILE_SIZE + TILE_SIZE / 2,  y: 3 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 14 * TILE_SIZE + TILE_SIZE / 2,  y: 8 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 3 * TILE_SIZE + TILE_SIZE / 2,   y: 8 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 3 * TILE_SIZE + TILE_SIZE / 2,   y: 5 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 10 * TILE_SIZE + TILE_SIZE / 2,  y: 5 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 10 * TILE_SIZE + TILE_SIZE / 2,  y: 7 * TILE_SIZE + TILE_SIZE / 2 },
      { x: 6 * TILE_SIZE + TILE_SIZE / 2,   y: 7 * TILE_SIZE + TILE_SIZE / 2 }
    ]
  }
];

const STAGE_NAMES = [
  "Whispering Forest", "Goblin Woods", "Green Valley", "Riverside Camp", "Orc Outpost",
  "Scorching Dunes", "Desert Oasis", "Bandit Pass", "Dustwind Gulch", "Lost Ruins",
  "Frozen Slopes", "Snowy Valley", "Ice Fang Cavern", "Glacial Peaks", "Frostbite Citadel",
  "Volcanic Brim", "Lava Crossway", "Obsidian Core", "Ashlands Slopes", "The Final Fortress"
];

const THEMES = ["grasslands", "desert", "frozen"];

export const LEVEL_DATA = Array.from({ length: 20 }, (_, idx) => {
  const id = idx + 1;
  const name = STAGE_NAMES[idx];
  
  // Distribute themes sequentially (every 5 levels cycles theme)
  const themeIndex = Math.floor(idx / 5) % THEMES.length;
  const theme = THEMES[themeIndex];
  
  // Map templates cycle
  const templateIdx = idx % MAP_TEMPLATES.length;
  const template = MAP_TEMPLATES[templateIdx];
  
  // Clone layout to inject obstacles dynamically
  const mapGrid = template.mapGrid.map(row => [...row]);
  
  // Add random destructible rock obstacles (cell value 9) on empty spaces (value 0)
  // The locations are hardcoded per level for stability
  let obstacles = [];
  if (id % 5 === 1) obstacles = [[1, 3], [4, 15], [8, 4]];
  else if (id % 5 === 2) obstacles = [[3, 8], [9, 14], [10, 5]];
  else if (id % 5 === 3) obstacles = [[2, 18], [6, 12], [8, 2]];
  else if (id % 5 === 4) obstacles = [[1, 10], [7, 5], [10, 12]];
  else obstacles = [[4, 2], [6, 17], [10, 8]];

  obstacles.forEach(([r, c]) => {
    if (mapGrid[r] && mapGrid[r][c] === 0) {
      mapGrid[r][c] = 9; // Obstacle rock
    }
  });

  const difficulties = ["Easy", "Medium", "Hard", "Expert"];
  const diffIdx = Math.min(Math.floor(idx / 5), 3);
  const difficulty = difficulties[diffIdx];

  const goldBonus = idx * 20;
  const hpBonus = Math.floor(idx / 3);
  const initialGold = 200 + goldBonus;

  return {
    id,
    name,
    difficulty,
    description: `Stage ${id} set in the ${theme} region. Defend the kingdom against ${difficulty} waves of attackers!`,
    theme,
    goldBonus,
    hpBonus,
    initialGold,
    mapGrid,
    pathWaypoints: template.pathWaypoints
  };
});
