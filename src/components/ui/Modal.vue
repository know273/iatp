<script setup>
defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: String, default: '500px' }
})
const emit = defineEmits(['close', 'confirm'])
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-container" :style="{ width: width }">
      <div class="modal-header">
        <span class="modal-title">{{ title }}</span>
        <button class="modal-close" @click="emit('close')">&times;</button>
      </div>
      <div class="modal-body">
        <slot />
      </div>
      <div class="modal-footer">
        <button class="modal-btn" @click="emit('close')">取消</button>
        <button class="modal-btn primary" @click="emit('confirm')">确定</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}
.modal-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}
.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}
.modal-close {
  background: transparent;
  border: none;
  font-size: 20px;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
}
.modal-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}
/* 封装通用表单样式 */
:deep(.form-group) {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}
:deep(.label-row) {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 12px;
}
:deep(.form-label) {
  font-size: 15px;
  font-weight: 500;
  color: #334155;
}
:deep(.label-link) {
  font-size: 13px;
  color: #8b5cf6;
  text-decoration: none;
  cursor: pointer;
}
:deep(.label-link:hover) {
  text-decoration: underline;
}
:deep(.form-input), :deep(.form-select) {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  background: #fff;
  transition: all 0.2s;
  box-sizing: border-box;
}
:deep(.form-input:focus), :deep(.form-select:focus) {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}
:deep(.form-input:disabled) {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}
.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.modal-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #475569;
}
.modal-btn.primary {
  background: #8b5cf6;
  border-color: #8b5cf6;
  color: #fff;
}
.modal-btn:hover {
  opacity: 0.9;
}
</style>
