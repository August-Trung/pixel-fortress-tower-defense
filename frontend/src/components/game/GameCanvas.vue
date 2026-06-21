<template>
  <div class="canvas-container fill-height d-flex align-center justify-center">
    <canvas ref="canvasEl" class="game-canvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useCanvas } from '../../composables/useCanvas.js';
import { useGameEngine } from '../../composables/useGameEngine.js';

const canvasEl = ref(null);
const { setupCanvas } = useCanvas();
const { initEngine, destroy } = useGameEngine();

onMounted(async () => {
  if (canvasEl.value) {
    setupCanvas(canvasEl.value);
    await initEngine(canvasEl.value);
  }
});

onUnmounted(() => {
  destroy();
});
</script>

<style scoped>
.canvas-container {
  background-color: #000;
  border: 4px solid #333;
  padding: 4px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.9), 0 8px 16px rgba(0, 0, 0, 0.6);
  border-radius: 4px;
}
.game-canvas {
  background-color: #2E7D32; /* Matches grass fallback color on load */
  display: block;
  image-rendering: pixelated;
  width: 100%;
  max-width: 960px;
  height: auto;
  aspect-ratio: 20 / 12;
}
</style>
