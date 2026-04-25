<script setup>
const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: '' },
  width: { type: String, default: '500px' }
})
const emit = defineEmits(['close', 'confirm'])
</script>

<template>
  <el-dialog
    :model-value="show"
    :title="title"
    :width="width"
    align-center
    destroy-on-close
    @close="emit('close')"
    @update:model-value="(v) => { if (!v) emit('close') }"
  >
    <slot />
    <template #footer>
      <div class="modal-footer">
        <el-button @click="emit('close')">取消</el-button>
        <el-button type="primary" @click="emit('confirm')">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
:deep(.el-dialog__body) {
  padding: 24px;
}

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
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
