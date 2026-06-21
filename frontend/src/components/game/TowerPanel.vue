<template>
  <div class="tower-panel py-4 px-3 pixel-card">
    <div class="font-game title mb-4 text-center">DEFENDERS</div>
    
    <div 
      v-for="tower in towers" 
      :key="tower.type"
      :class="['tower-item mb-3', { 'active': selectedType === tower.type, 'disabled': gold < tower.cost }]"
      @click="selectTower(tower)"
    >
      <div class="d-flex justify-space-between align-center font-game font-size-10">
        <div class="d-flex align-center">
          <span class="tower-emoji mr-2">{{ getEmoji(tower.type) }}</span>
          <span class="tower-name">{{ tower.name }}</span>
        </div>
        <div class="cost text-amber">🪙{{ tower.cost }}</div>
      </div>
      
      <div class="tower-desc mt-2 pl-6">
        <div>DMG: {{ tower.damage }} | RNG: {{ tower.range }}px</div>
        <div>RATE: {{ tower.fireRate }}s</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  towers: {
    type: Array,
    required: true
  },
  gold: {
    type: Number,
    required: true
  },
  selectedType: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['select-tower']);

function getEmoji(type) {
  if (type === 'archer') return '🏹';
  if (type === 'mage') return '🔮';
  if (type === 'ice') return '❄️';
  return '🏰';
}

function selectTower(tower) {
  if (props.gold >= tower.cost) {
    emit('select-tower', tower.type);
  }
}
</script>

<style scoped>
.tower-panel {
  width: 100%;
  height: 100%;
}
.title {
  font-size: 11px;
  color: #fff;
  border-bottom: 3px solid #333;
  padding-bottom: 8px;
}
.tower-item {
  border: 3px solid #333;
  padding: 8px;
  background-color: #1f2833;
  cursor: pointer;
  transition: all 0.1s ease;
}
.tower-item:hover:not(.disabled) {
  border-color: var(--color-primary);
  background-color: #2b3a4a;
}
.tower-item.active {
  border-color: var(--color-secondary);
  background-color: #1a2f2d;
}
.tower-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #111;
  border-color: #222;
}
.font-size-10 {
  font-size: 9px;
}
.tower-emoji {
  font-size: 14px;
}
.tower-name {
  color: #fff;
}
.tower-desc {
  font-size: 11px;
  color: #888;
  line-height: 1.3;
}
</style>
