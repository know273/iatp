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
  <section class="card">
    <div class="card-title title-fit" @click="toggle">
      {{ title }}
      <span class="arrow" aria-hidden="true">
        <img v-if="open" class="arrow-icon" :src="caretBottom" width="16" height="16" alt="" />
        <img v-else class="arrow-icon" :src="caretBottom" width="16" height="16" style="transform: rotate(-90deg);" alt="" />
      </span>
    </div>
    <div v-show="open" class="card-body">
      <slot />
    </div>
  </section>
  </template>

<style scoped>
.card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
  overflow: hidden;
  text-align: left;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  padding: 14px 16px;
  border-bottom: 1px solid #cb9595;
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
  padding: 16px;
  text-align: left;
}
</style>
