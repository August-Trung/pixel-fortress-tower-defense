<template>
  <div class="speed-control py-3 px-3 pixel-card font-game d-flex align-center justify-space-between">
    <div class="speed-label">SIMULATION SPEED</div>
    
    <div class="d-flex align-center">
      <button 
        :class="['speed-option mr-2', { 'active': speed === 1 }]"
        @click="$emit('change-speed', 1)"
      >
        1X
      </button>
      <button 
        :class="['speed-option', { 'active': speed === 2 }]"
        @click="$emit('change-speed', 2)"
      >
        2X
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  speed: {
    type: Number,
    required: true
  }
});

defineEmits(['change-speed']);
</script>

<style scoped>
.speed-control {
  width: 100%;
}
.speed-label {
  font-size: 8px;
  color: #888;
}
.speed-option {
  font-family: var(--font-game);
  font-size: 9px;
  color: #fff;
  border: 3px solid #333;
  background-color: #1f2833;
  padding: 4px 10px;
  cursor: pointer;
  outline: none;
}
.speed-option:hover {
  border-color: var(--color-primary);
}
.speed-option.active {
  border-color: var(--color-secondary);
  background-color: #1a2f2d;
}
</style>
