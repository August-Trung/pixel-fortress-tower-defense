# 🏰 Pixel Fortress — Tower Defense Web Game

Pixel Fortress is a retro-style, 2D Single Player Tower Defense game built using a modern web stack. Players place defense towers along a designated medieval path to fight hordes of fantasy creatures (Skeletons, Dark Wolves, Orc Warriors, and a final Dragon Boss). 

This project was built for a web game application coursework.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Vue 3 (Composition API)
- **UI Library**: Vuetify 3 (Dark Theme, custom layouts)
- **State Management**: Pinia (Reactive store state synchronization)
- **Router**: Vue Router 4 (Navigation between screens)
- **Rendering Layer**: HTML5 Canvas API (High-performance rendering loop)
- **Networking**: Axios (Backend API communication client)

### Backend
- **Framework**: ASP.NET Core 8/9 Web API (Minimal hosting architecture)
- **ORM**: Entity Framework Core
- **Database**: SQLite (Local embedded database)
- **Deployment**: Docker-ready for hosting providers like Render.com

---

## 📋 Prerequisites
- **Node.js**: `v20.17.0` or higher (tested on `v20.17.0` with Vite 5)
- **.NET SDK**: `v9.0` or higher

---

## 🚀 Setup & Launch Instructions

### 1. Launching the Backend (ASP.NET Core Web API)
Go to the `backend` directory, restore packages, and start the application server:
```powershell
cd backend
dotnet restore
dotnet run
```
- The backend Web API binds dynamically and listens by default on: **`http://localhost:5000`**
- It automatically creates the SQLite database file (`pixelfortress.db`) and seeds it with demo player stats on startup.
- You can access the API Swagger documentation endpoint at: `http://localhost:5000/openapi/v1.json` or through Swagger UI if running in development mode.

### 2. Launching the Frontend (Vue 3 + Vite)
Go to the `frontend` directory, install packages, and boot the development server:
```powershell
cd frontend
npm install
npm run dev
```
- Open your browser and navigate to the default address: **`http://localhost:5173`**

---

## 🎮 Game Controls & Gameplay Loop

1. **Main Menu (HomeView)**: Enter your player profile name (1-50 characters) and click **Play Game** or check the global leaderboards.
2. **Defenders Placement**: Choose your defense towers in the sidebar panel:
   - **🏹 Archer Tower** (🪙50): Fast speed, single target, moderate range.
   - **🔮 Mage Tower** (🪙100): Slow speed, heavy magic damage.
   - **❄️ Ice Tower** (🪙75): Slows target speed by `30%` for `2s`.
3. **Placing Mode**: Select a tower type and hover on the canvas. Valid placement areas (grass tiles) will render a **Green box** with the range radius, while invalid paths render a **Red box**. Click left mouse to deploy.
4. **Upgrade & Sell**: Left-click on any placed tower on the grid to inspect details:
   - **Upgrade**: Max level is 3. Level 2 costs `60%` base cost (+50% DMG, +10% RNG). Level 3 costs `100%` base cost (+100% DMG, +20% RNG).
   - **Sell**: Receive a `50%` refund of all gold invested.
5. **Right-Click**: Cancel current tower placement mode or deselect tower details.
6. **Speed Control**: Toggle simulation speed between `1x` (normal) and `2x` (fast forward) to test your defense setups under pressure.
7. **Wave Progression**: Complete all enemies in a wave to claim gold bonuses. Press **Start Wave** manually to spawn the next horde. Wave 10 spawns the legendary **Dragon Boss** (800 HP).

---

## 📊 Database Schema Design

The SQLite schema consists of two tables:
1. **Players**: Stores player profiles (`Id`, `Name` - unique, `CreatedAt`).
2. **Scores**: Stores submission records (`Id`, `PlayerId` - foreign key, `Score`, `WavesCompleted`, `EnemiesKilled`, `TotalGoldEarned`, `RemainingHP`, `TimePlayed`, `CreatedAt`).

*Note: Global rankings show the best score per player, sorted descending.*

---

## 🔌 API Documentation Summary

- **`POST /api/players`**: Register or retrieve a player name.
  - *Request Body*: `{ "name": "PlayerOne" }`
  - *Response*: `{ "id": 1, "name": "PlayerOne", "createdAt": "..." }`
- **`GET /api/players/{id}`**: Get player profile.
- **`POST /api/scores`**: Submit game metrics.
  - *Request Body*: `{ "playerId": 1, "score": 2500, "wavesCompleted": 10, "enemiesKilled": 85, "totalGoldEarned": 1200, "remainingHP": 15, "timePlayed": 420 }`
- **`GET /api/scores/ranking?limit=20`**: Fetch the top 20 rankings leaderboard.
- **`GET /api/scores/player/{playerId}`**: Fetch a player's score history.

---

## 🎥 Walkthrough Demo Script

For project presentations, follow this flow:
1. **Home**: Enter a new username (e.g. `Arthur`) and click **Play**.
2. **Setup**: Select **Archer Tower** in the defenders panel and deploy it at row 1, col 3.
3. **Fight**: Press **Start Wave 1**. Skeletons spawn. Deploy an **Ice Tower** nearby to slow them down.
4. **Upgrade**: During Wave 2, select the **Archer Tower** and click **Upgrade** to increase range and damage.
5. **Dethroned**: Complete the wave, click **Quit to Menu**, navigate to the **Leaderboard** screen, and inspect your newly registered score alongside seeded legends like Merlin and Robin!
