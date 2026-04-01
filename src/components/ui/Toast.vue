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
let closeTimer = null
watch(() => props.show, (v) => {
  visible.value = v
  if (v && props.duration > 0) {
    if (closeTimer) clearTimeout(closeTimer)
    closeTimer = setTimeout(() => emit('update:show', false), props.duration)
  }
})
const close = () => emit('update:show', false)
</script>

<template>
  <Transition name="toast-fade">
    <div v-if="visible" class="toast-wrap" @click="close">
      <div class="toast" :class="type" role="status" aria-live="polite">
        <span class="toast-icon" :class="type" aria-hidden="true">
          <svg v-if="type === 'success'" viewBox="0 0 24 24">
            <path d="M9.2 16.6 4.9 12.3 3.5 13.7 9.2 19.4 20.6 8 19.2 6.6z" />
          </svg>
          <svg v-else-if="type === 'error'" viewBox="0 0 24 24">
            <path d="M12 10.6 7.8 6.4 6.4 7.8 10.6 12 6.4 16.2 7.8 17.6 12 13.4 16.2 17.6 17.6 16.2 13.4 12 17.6 7.8 16.2 6.4z" />
          </svg>
          <svg v-else viewBox="0 0 24 24">
            <path d="M11 7h2v2h-2zm0 4h2v6h-2z" />
          </svg>
        </span>
        <span class="toast-msg">{{ message }}</span>
      </div>
    </div>
  </Transition>
  </template>

<style scoped>
.toast-wrap {
  position: fixed;
  left: 50%;
  top: 72px;
  transform: translateX(-50%);
  z-index: 9999;
}
.toast {
  min-width: 200px;
  max-width: 520px;
  padding: 12px 18px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.12);
  font-size: 15px;
  color: #0f172a;
  display: inline-flex;
  align-items: center;
  gap: 12px;
}
.toast-icon {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 22px;
}
.toast-icon svg {
  width: 14px;
  height: 14px;
  fill: #fff;
}
.toast-icon.success { background: #2DB36A; }
.toast-icon.error { background: #ff4d4f; }
.toast-icon.info { background: #3a78f4; }
.toast-msg {
  line-height: 1.4;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-6px);
}
.toast-fade-enter-to,
.toast-fade-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>
