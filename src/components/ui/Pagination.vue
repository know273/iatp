<script setup>
import { computed } from 'vue'

const props = defineProps({
  total: { type: Number, required: true },
  pageSize: { type: Number, default: 10 },
  modelValue: { type: Number, default: 1 }
})
const emit = defineEmits(['update:modelValue'])

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const currentPage = computed({
  get: () => Math.min(Math.max(props.modelValue, 1), totalPages.value),
  set: v => emit('update:modelValue', v)
})
const visiblePages = computed(() => {
  const tp = totalPages.value
  if (tp <= 4) return Array.from({ length: tp }, (_, i) => i + 1)
  let start = Math.max(1, currentPage.value - 1)
  if (start + 3 > tp) start = tp - 3
  return [start, start + 1, start + 2, start + 3]
})
const gotoPage = p => {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
}
const prev = () => gotoPage(currentPage.value - 1)
const next = () => gotoPage(currentPage.value + 1)
</script>

<template>
  <div class="pager" v-if="total > 0">
    <div class="pager-total">共{{ total }}条</div>
    <button class="pager-btn" :disabled="currentPage === 1" @click="prev">‹</button>
    <button
      v-for="p in visiblePages"
      :key="p"
      class="pager-num"
      :class="{ active: p === currentPage }"
      @click="gotoPage(p)"
    >{{ p }}</button>
    <button class="pager-btn" :disabled="currentPage === totalPages" @click="next">›</button>
  </div>
</template>

<style scoped>
.pager {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}
.pager-total {
  color: #666;
  margin-right: 8px;
}
.pager-btn,
.pager-num {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #eee;
  background: #f8f8f8;
  border-radius: 4px;
  cursor: pointer;
  color: #333;
}
.pager-btn[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
.pager-num.active {
  background: #2DB36A;
  color: #fff;
  border-color: #2DB36A;
}
</style>
