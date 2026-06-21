<template>
  <div class="game-hud px-4 py-3 d-flex justify-space-between align-center font-game blue-stone-hud">
    <div class="hud-item d-flex align-center carved-slot">
      <span class="icon">❤️</span>
      <span class="hud-label">HP</span>
      <span class="hud-value text-red">{{ hp }}</span>
    </div>
    
    <div class="hud-item d-flex align-center carved-slot">
      <span class="icon">🪙</span>
      <span class="hud-label">GOLD</span>
      <span class="hud-value text-amber">{{ gold }}</span>
    </div>
    
    <div class="hud-item d-flex align-center carved-slot">
      <span class="icon">🌊</span>
      <span class="hud-label">WAVE</span>
      <span class="hud-value text-cyan">{{ wave }}<span class="hud-max">/{{ maxWave }}</span></span>
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
  width: 100%;
  color: #e0f2fe;
  text-shadow: 1px 1px 2px #080d14;
  border-radius: 0;
}

/* Rich slate-blue stone panel background and carved border style */
.blue-stone-hud {
  background: linear-gradient(135deg, #2b4560 0%, #1e2f42 50%, #152230 100%);
  border: 4px solid #0b111a;
  box-shadow: 
    0 -4px 0 -2px #0b111a, 
    0 4px 0 -2px #0b111a, 
    -4px 0 0 -2px #0b111a, 
    4px 0 0 -2px #0b111a,
    inset 0 4px 0 rgba(255, 255, 255, 0.15), /* highlight top edge */
    inset 0 -4px 0 rgba(0, 0, 0, 0.4),       /* shadow bottom edge */
    0 8px 16px rgba(0, 0, 0, 0.5);           /* outer drop shadow */
}

/* Inset slots carved into the stone */
.carved-slot {
  background: rgba(8, 13, 20, 0.6);
  padding: 6px 14px;
  border-radius: 2px;
  border: 2px solid #14202e;
  box-shadow: 
    inset 0 2px 4px rgba(0,0,0,0.85),
    0 1px 0 rgba(255,255,255,0.08);
  gap: 8px;
}

.hud-item {
  font-size: 10px;
  letter-spacing: 0.5px;
}

.hud-label {
  color: #b0bec5;
  font-size: 9px;
  margin-right: 4px;
}

.hud-value {
  font-weight: bold;
}

.text-red {
  color: #ff5252 !important;
  text-shadow: 0 0 4px rgba(255,82,82,0.4);
}

.text-amber {
  color: #ffd740 !important;
  text-shadow: 0 0 4px rgba(255,215,64,0.4);
}

.text-cyan {
  color: #00e5ff !important;
  text-shadow: 0 0 4px rgba(0,229,255,0.4);
}

.hud-max {
  color: #78909c;
  font-size: 7px;
  margin-left: 2px;
}

.icon {
  font-size: 13px;
  display: inline-flex;
  align-items: center;
}
</style>
