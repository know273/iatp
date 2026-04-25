<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, default: '' },
  status: { type: String, default: '' },
  progress: { type: Number, default: 0 },
  subtitle: { type: String, default: '' },
  showProgress: { type: Boolean, default: true }
})

const badge = computed(() => {
  const s = String(props.status || '')
  if (s === 'done') return { text: '已完成', cls: 'ok' }
  if (s === 'failed') return { text: '失败', cls: 'bad' }
  if (s === 'running') return { text: '进行中', cls: 'info' }
  if (s === 'pending') return { text: '排队中', cls: 'muted' }
  return { text: s || '-', cls: 'muted' }
})

const pct = computed(() => Math.max(0, Math.min(100, Number(props.progress) || 0)))
const showBar = computed(() => props.showProgress && (badge.value.cls === 'info' || badge.value.cls === 'muted'))
</script>

<template>
  <div class="task-card">
    <div class="head">
      <div class="left">
        <div class="title">{{ title }}</div>
        <div v-if="subtitle" class="subtitle">{{ subtitle }}</div>
      </div>
      <div class="right">
        <span class="badge" :class="badge.cls">{{ badge.text }}</span>
      </div>
    </div>

    <div v-if="showBar" class="progress">
      <div class="bar" :style="{ width: `${pct}%` }"></div>
    </div>

    <div class="body">
      <slot />
    </div>

    <div v-if="$slots.actions" class="actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped>
.task-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
  border: 1px solid #eef2ff;
  padding: 14px 16px;
}
.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.title {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}
.subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: #64748b;
}
.badge {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
}
.badge.ok {
  color: #16a34a;
  background: #dcfce7;
  border-color: #bbf7d0;
}
.badge.bad {
  color: #ef4444;
  background: #fee2e2;
  border-color: #fecaca;
}
.badge.info {
  color: #4f46e5;
  background: #e0e7ff;
  border-color: #c7d2fe;
}
.badge.muted {
  color: #475569;
  background: #f1f5f9;
  border-color: #e2e8f0;
}
.progress {
  margin-top: 12px;
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
  overflow: hidden;
}
.bar {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%);
  transition: width 0.25s ease;
}
.body {
  margin-top: 12px;
  font-size: 13px;
  color: #334155;
  line-height: 1.5;
}
.actions {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
