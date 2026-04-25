<script setup>
import { computed } from 'vue'

const props = defineProps({
  total: { type: Number, required: true },
  pageSize: { type: Number, default: 10 },
  modelValue: { type: Number, default: 1 }
})
const emit = defineEmits(['update:modelValue'])

const currentPage = computed({
  get: () => props.modelValue,
  set: v => emit('update:modelValue', v)
})
</script>

<template>
  <el-pagination
    v-if="total > 0"
    v-model:current-page="currentPage"
    :page-size="pageSize"
    :total="total"
    :pager-count="4"
    layout="total, prev, pager, next"
    class="pager"
  />
</template>

<style scoped>
.pager {
  margin-top: 12px;
}
</style>
