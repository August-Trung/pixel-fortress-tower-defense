<template>
  <div class="overlay-container d-flex align-center justify-center font-game">
    <div class="pixel-card text-center py-6 px-8 win-card">
      <h1 class="text-success title mb-4 blink">VICTORY</h1>
      
      <div class="score-display mb-4">
        <div class="score-label mb-1">FINAL SCORE</div>
        <div class="score-value text-amber font-size-18">{{ score }}</div>
      </div>
      
      <div class="stats-table mb-4">
        <div class="stats-row">
          <span>WAVES CLEARED:</span>
          <span class="text-white">{{ stats.wavesCompleted }} / 10</span>
        </div>
        <div class="stats-row">
          <span>ENEMIES SLAIN:</span>
          <span class="text-white">{{ stats.enemiesKilled }}</span>
        </div>
        <div class="stats-row">
          <span>GOLD EARNED:</span>
          <span class="text-white">🪙{{ stats.totalGoldEarned }}</span>
        </div>
        <div class="stats-row">
          <span>SURVIVED HP:</span>
          <span class="text-white">❤️{{ stats.remainingHP }}</span>
        </div>
        <div class="stats-row">
          <span>TIME PLAYED:</span>
          <span class="text-white">{{ formatTime(stats.timePlayed) }}</span>
        </div>
      </div>
      
      <div class="actions d-flex flex-column align-stretch">
        <button 
          class="pixel-btn secondary mb-3" 
          :disabled="submitted"
          @click="submit"
        >
          {{ submitted ? 'SCORE SUBMITTED' : 'SUBMIT SCORE' }}
        </button>
        <button 
          class="pixel-btn" 
          @click="$emit('play-again')"
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  score: {
    type: Number,
    required: true
  },
  stats: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['submit-score', 'play-again']);

const submitted = ref(false);

function submit() {
  if (!submitted.value) {
    submitted.value = true;
    emit('submit-score');
  }
}

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
.win-card {
  max-width: 400px;
  width: 90%;
  border-color: #2E7D32 !important;
}
.title {
  font-size: 20px;
  color: #4CAF50;
  letter-spacing: 2px;
}
.score-label {
  font-size: 9px;
  color: #888;
}
.score-value {
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
