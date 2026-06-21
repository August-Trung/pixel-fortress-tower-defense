<template>
  <button
    :class="['pixel-btn', typeClass]"
    :disabled="disabled"
    @click="onClick"
  >
    <slot></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  color: {
    type: String,
    default: 'primary' // 'primary', 'secondary', 'accent', 'danger'
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['click']);

const typeClass = computed(() => {
  if (props.color === 'secondary') return 'secondary';
  if (props.color === 'accent') return 'accent';
  if (props.color === 'danger') return 'danger';
  return '';
});

function onClick(e) {
  if (!props.disabled) {
    emit('click', e);
  }
}
</script>
