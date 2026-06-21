<template>
  <div class="overlay-container d-flex align-center justify-center font-game">
    <div class="pixel-card text-center py-6 px-8 lose-card">
      <h1 class="text-danger title mb-4 blink">DEFEAT</h1>
      
      <div class="defeat-details mb-4">
        <div class="label mb-1">FALLEN AT WAVE</div>
        <div class="value text-red font-size-18">{{ wave }}</div>
      </div>
      
      <div class="stats-table mb-4">
        <div class="stats-row">
          <span>ENEMIES SLAIN:</span>
          <span class="text-white">{{ stats.enemiesKilled }}</span>
        </div>
        <div class="stats-row">
          <span>GOLD EARNED:</span>
          <span class="text-white">🪙{{ stats.totalGoldEarned }}</span>
        </div>
        <div class="stats-row">
          <span>TIME PLAYED:</span>
          <span class="text-white">{{ formatTime(stats.timePlayed) }}</span>
        </div>
      </div>
      
      <div class="actions d-flex flex-column align-stretch">
        <button 
          class="pixel-btn danger mb-3" 
          @click="$emit('retry')"
        >
          TRY AGAIN
        </button>
        <button 
          class="pixel-btn secondary" 
          @click="$emit('go-home')"
        >
          MAIN MENU
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  wave: {
    type: Number,
    required: true
  },
  stats: {
    type: Object,
    required: true
  }
});

defineEmits(['retry', 'go-home']);

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
</script>

<style scoped>
.overlay-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  z-index: 100;
  display: flex;
}
.lose-card {
  max-width: 400px;
  width: 90%;
  border-color: #d32f2f !important;
}
.title {
  font-size: 20px;
  color: #f44336;
  letter-spacing: 2px;
}
.label {
  font-size: 9px;
  color: #888;
}
.value {
  font-size: 24px;
  font-weight: bold;
}
.stats-table {
  border-top: 3px solid #333;
  border-bottom: 3px solid #333;
  padding: 10px 0;
  font-size: 8px;
  text-align: left;
}
.stats-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}
.stats-row:last-child {
  margin-bottom: 0;
}
.font-size-18 {
  font-size: 18px;
}
</style>
