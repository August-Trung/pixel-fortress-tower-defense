<template>
  <div class="wave-info py-3 px-3 pixel-card font-game d-flex align-center justify-space-between">
    <div>
      <div class="wave-label mb-1">CAMPAIGN PROGRESS</div>
      <div class="wave-count text-white">WAVE {{ currentWave }} / {{ totalWaves }}</div>
    </div>
    
    <button 
      class="pixel-btn secondary" 
      v-if="!waveActive"
      @click="$emit('start-wave')"
    >
      START WAVE
    </button>
    <div class="wave-running text-amber blink" v-else>
      WAVE ACTIVE
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentWave: {
    type: Number,
    required: true
  },
  totalWaves: {
    type: Number,
    required: true
  },
  waveActive: {
    type: Boolean,
    required: true
  }
});

defineEmits(['start-wave']);
</script>

<style scoped>
.wave-info {
  width: 100%;
}
.wave-label {
  font-size: 8px;
  color: #888;
}
.wave-count {
  font-size: 11px;
}
.wave-running {
  font-size: 10px;
}
</style>
