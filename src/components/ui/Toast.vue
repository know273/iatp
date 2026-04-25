<script setup>
import { watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  show: { type: Boolean, default: false },
  message: { type: String, default: '' },
  type: { type: String, default: 'success' },
  duration: { type: Number, default: 2000 }
})
const emit = defineEmits(['update:show'])
watch(() => props.show, (v) => {
  if (!v) return
  const type = ['success', 'warning', 'info', 'error'].includes(props.type) ? props.type : 'info'
  ElMessage({
    message: props.message || '',
    type,
    duration: props.duration,
    showClose: true
  })
  emit('update:show', false)
})
</script>

<template>
  <span />
</template>
