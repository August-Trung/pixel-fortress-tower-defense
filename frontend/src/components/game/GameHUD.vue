<template>
  <div class="game-hud px-4 py-3 d-flex justify-space-between align-center font-game pixel-card">
    <div class="hud-item d-flex align-center">
      <span class="mr-2 icon">❤️</span>
      <span class="hud-label mr-1">HP:</span>
      <span class="hud-value text-red">{{ hp }}</span>
    </div>
    
    <div class="hud-item d-flex align-center">
      <span class="mr-2 icon">🪙</span>
      <span class="hud-label mr-1">GOLD:</span>
      <span class="hud-value text-amber">{{ gold }}</span>
    </div>
    
    <div class="hud-item d-flex align-center">
      <span class="mr-2 icon">🌊</span>
      <span class="hud-label mr-1">WAVE:</span>
      <span class="hud-value text-blue">{{ wave }}</span>
      <span class="hud-max">/{{ maxWave }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  hp: {
    type: Number,
    required: true
  },
  gold: {
    type: Number,
    required: true
  },
  wave: {
    type: Number,
    required: true
  },
  maxWave: {
    type: Number,
    required: true
  }
});
</script>

<style scoped>
.game-hud {
  color: #fff;
  border-radius: 0;
  width: 100%;
}
.hud-item {
  font-size: 11px;
}
.hud-value {
  font-weight: bold;
}
.hud-max {
  color: #888;
  font-size: 9px;
}
.hud-label {
  color: #aaa;
}
.icon {
  font-size: 14px;
}
</style>
