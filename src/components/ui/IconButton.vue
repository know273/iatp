<script setup>
import { computed } from 'vue'

const props = defineProps({
  src: { type: String, required: true },
  title: { type: String, default: '' },
  alt: { type: String, default: '' },
  size: { type: Number, default: 16 },
  buttonSize: { type: Number, default: 32 },
  cursor: { type: String, default: 'help' }
})

defineEmits(['click'])

const btnStyle = computed(() => ({
  width: `${props.buttonSize}px`,
  height: `${props.buttonSize}px`
}))

const imgStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  cursor: props.cursor
}))
</script>

<template>
  <button class="icon-btn" type="button" :style="btnStyle" :aria-label="title || alt" @click="$emit('click')">
    <img class="icon-btn__img" :src="src" :alt="alt" :title="title" :style="imgStyle" />
  </button>
</template>

<style scoped>
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  border-radius: 6px;
}
.icon-btn__img {
  display: block;
  opacity: 0.75;
}
.icon-btn:hover .icon-btn__img {
  opacity: 1;
}
.icon-btn:active {
  opacity: 0.7;
}
</style>
