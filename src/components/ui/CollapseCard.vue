<script setup>
import { computed } from 'vue'
import caretBottom from '../../assets/caret-bottom-svgrepo-com.svg'

const props = defineProps({
  title: { type: String, required: true },
  modelValue: { type: Boolean, default: true }
})
const emit = defineEmits(['update:modelValue'])
const open = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})
const toggle = () => {
  open.value = !open.value
}
</script>

<template>
  <el-card class="card" shadow="never">
    <template #header>
      <div class="card-title title-fit" @click="toggle">
        {{ title }}
        <span class="arrow" aria-hidden="true">
          <img v-if="open" class="arrow-icon" :src="caretBottom" width="16" height="16" alt="" />
          <img v-else class="arrow-icon" :src="caretBottom" width="16" height="16" style="transform: rotate(-90deg);" alt="" />
        </span>
      </div>
    </template>
    <div v-show="open" class="card-body">
      <slot />
    </div>
  </el-card>
</template>

<style scoped>
.card {
  margin-bottom: 16px;
  text-align: left;
}
:deep(.el-card__header) {
  padding: 6px 8px;
}
:deep(.el-card__body) {
  padding: 6px 8px;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  text-align: left;
  color:#2DB36A
}
.card-title.title-fit {
  display: inline-flex;
  width: fit-content;
  box-sizing: content-box;
  gap: 8px;
}
.arrow {
  color: #ef5454;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
}
.arrow-icon {
  width: 16px;
  height: 16px;
  display: inline-block;
  transition: transform 0.2s ease;
}
.card-body {
  padding: 0;
  text-align: left;
}
</style>
