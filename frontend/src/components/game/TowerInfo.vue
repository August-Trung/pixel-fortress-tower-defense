<template>
  <div class="tower-info py-3 px-3 pixel-card font-game" v-if="selectedTower">
    <div class="title mb-2 text-center text-uppercase">{{ selectedTower.name }}</div>
    
    <template v-if="selectedTower.type === 'obstacle'">
      <div class="stats mb-4 text-center text-grey">
        This heavy rock blocks defenses. Pay gold to clear this tile!
      </div>
      <div class="actions d-flex flex-column align-stretch">
        <button 
          class="pixel-btn" 
          :disabled="gold < selectedTower.cost"
          @click="$emit('clear-obstacle', { x: selectedTower.gridX, y: selectedTower.gridY })"
        >
          CLEAR (-🪙{{ selectedTower.cost }})
        </button>
      </div>
    </template>
    
    <template v-else>
      <div class="subtitle text-center mb-3 text-blue">Level {{ selectedTower.level }}</div>
      
      <div class="stats mb-3 pl-1">
        <div class="d-flex justify-space-between mb-2">
          <span>DMG:</span>
          <span class="value text-white">{{ selectedTower.damage }}</span>
        </div>
        <div class="d-flex justify-space-between mb-2">
          <span>RNG:</span>
          <span class="value text-white">{{ selectedTower.range }}px</span>
        </div>
        <div class="d-flex justify-space-between mb-2">
          <span>RATE:</span>
          <span class="value text-white">{{ selectedTower.fireRate }}s</span>
        </div>
      </div>
      
      <div class="actions d-flex flex-column align-stretch">
        <button 
          v-if="selectedTower.level < 3"
          class="pixel-btn mb-2" 
          :disabled="gold < upgradeCost"
          @click="$emit('upgrade', selectedTower.id)"
        >
          UPGRADE (-🪙{{ upgradeCost }})
        </button>
        <div v-else class="max-level text-center mb-2">MAX LEVEL</div>
        
        <button 
          class="pixel-btn danger" 
          @click="$emit('sell', selectedTower.id)"
        >
          SELL (+🪙{{ selectedTower.sellPrice }})
        </button>
      </div>
    </template>
  </div>
  <div class="tower-info py-4 px-3 pixel-card text-center font-game font-size-8 empty" v-else>
    Select a tower or obstacle on the map to interact.
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  selectedTower: {
    type: Object,
    default: null
  },
  gold: {
    type: Number,
    required: true
  }
});

defineEmits(['upgrade', 'sell']);

const upgradeCost = computed(() => {
  if (!props.selectedTower) return 0;
  const baseCost = props.selectedTower.cost;
  return props.selectedTower.level === 1 ? Math.floor(baseCost * 0.6) : baseCost;
});
</script>

<style scoped>
.tower-info {
  width: 100%;
}
.title {
  font-size: 10px;
  color: #fff;
  border-bottom: 3px solid #333;
  padding-bottom: 6px;
}
.subtitle {
  font-size: 9px;
}
.stats {
  font-size: 9px;
  color: #aaa;
}
.value {
  font-weight: bold;
}
.max-level {
  font-size: 9px;
  border: 3px solid #2E7D32;
  padding: 6px;
  background-color: #1b5e20;
  color: #fff;
  text-transform: uppercase;
}
.empty {
  color: #888;
  font-size: 8px;
  line-height: 1.5;
}
.font-size-8 {
  font-size: 8px;
}
</style>
