<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  message: { type: String, default: '' },
  type: { type: String, default: 'success' },
  duration: { type: Number, default: 2000 }
})
const emit = defineEmits(['update:show'])
const visible = ref(props.show)
watch(() => props.show, (v) => {
  visible.value = v
  if (v && props.duration > 0) {
    setTimeout(() => emit('update:show', false), props.duration)
  }
})
const close = () => emit('update:show', false)
</script>

<template>
  <div v-if="show" class="toast-wrap" @click="close">
    <div class="toast" :class="type">{{ message }}</div>
  </div>
  </template>

<style scoped>
.toast-wrap {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 9999;
}
.toast {
  min-width: 160px;
  max-width: 360px;
  padding: 10px 14px;
  border-radius: 6px;
  color: #fff;
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
  font-size: 14px;
}
.toast.success { background: #2DB36A; }
.toast.error { background: #ff4d4f; }
.toast.info { background: #3a78f4; }
</style>
