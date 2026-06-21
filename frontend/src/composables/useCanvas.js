import { ref } from 'vue';

export function useCanvas() {
  const canvasRef = ref(null);
  const ctx = ref(null);

  function setupCanvas(canvasElement) {
    if (!canvasElement) return;
    canvasRef.value = canvasElement;
    // Game dimensions are 960x576 as defined in section 11
    canvasElement.width = 960; 
    canvasElement.height = 576;
    ctx.value = canvasElement.getContext('2d');
  }

  return {
    canvasRef,
    ctx,
    setupCanvas
  };
}
