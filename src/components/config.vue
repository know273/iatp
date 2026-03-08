<script setup>
import { ref } from 'vue'

const apiBase = ref(import.meta.env.VITE_API_BASE || localStorage.getItem('apiBase') || 'http://127.0.0.1:5000')
const saving = ref(false)
const saved = ref(false)
const error = ref('')

const save = async () => {
  error.value = ''
  saved.value = false
  saving.value = true
  try {
    localStorage.setItem('apiBase', apiBase.value || '')
    saved.value = true
  } finally {
    saving.value = false
  }
}
const openBase = () => {
  const url = apiBase.value || ''
  if (!url) return
  window.open(url, '_blank')
}
</script>

<template>
  <div class="page-full">
    <div class="page-full-title">配置管理</div>
    <div class="page-full-body">
      <div class="form-item">
        <label class="label">后端服务地址</label>
        <input class="input" v-model="apiBase" placeholder="例如: http://127.0.0.1:5000" />
        <div class="tips">优先使用此处设置，其次使用环境变量VITE_API_BASE</div>
      </div>
      <div class="btns">
        <button class="btn primary" :disabled="saving" @click="save">{{ saving ? '保存中' : '保存' }}</button>
        <button class="btn" @click="openBase">打开</button>
      </div>
      <div class="ok" v-if="saved">已保存</div>
      <div class="err" v-if="error">{{ error }}</div>
    </div>
  </div>
  </template>

<style scoped>
.page-full {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}
.page-full-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
}
.page-full-body {
  flex: 1;
  padding: 16px;
  color: #333;
}
.form-item {
  margin-bottom: 12px;
}
.label {
  display: block;
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}
.input {
  width: 520px;
  max-width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}
.btns {
  display: flex;
  gap: 10px;
}
.btn {
  height: 36px;
  padding: 0 14px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #f9f9f9;
  cursor: pointer;
  font-size: 14px;
}
.btn.primary {
  color: #fff;
  background: linear-gradient(90deg, #1e50c8 0%, #3a78f4 100%);
  border-color: #1e50c8;
}
.tips {
  color: #999;
  margin-top: 6px;
}
.ok {
  color: #2DB36A;
  margin-top: 10px;
}
.err {
  color: #ff4d4f;
  margin-top: 10px;
}
</style>
