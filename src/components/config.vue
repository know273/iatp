<script setup>
import { ref, computed, watch } from 'vue'
import ProviderEditModal from './ProviderEditModal.vue'

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

const providers = ref([
  { id: 1, name: '火山引擎', enabled: true, icon: 'https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/34966601f07f4347916960810486f03e~tplv-k3u1fbpfcp-zoom-1.image' },
  { id: 2, name: '腾讯云', enabled: true, icon: 'https://cloudcache.tencent-cloud.com/qcloud/ui/static/static_sources/logo/logo-light.svg' }
])

const showEditModal = ref(false)
const currentProvider = ref(null)

const openEditModal = (p) => {
  currentProvider.value = { ...p }
  showEditModal.value = true
}

const handleProviderSave = (p) => {
  const idx = providers.value.findIndex(x => x.id === p.id)
  if (idx > -1) {
    providers.value[idx] = { ...p }
  }
  loadActiveConfig()
}

const activeProviderId = computed(() => providers.value.find(x => x.enabled)?.id || providers.value[0]?.id || '')
const activeProviderConfig = ref({})
const loadActiveConfig = () => {
  const id = activeProviderId.value
  if (!id) {
    activeProviderConfig.value = {}
    return
  }
  activeProviderConfig.value = JSON.parse(localStorage.getItem(`provider_${id}_config`) || '{}')
}
watch(activeProviderId, loadActiveConfig, { immediate: true })
watch(showEditModal, (v) => {
  if (!v) loadActiveConfig()
})

const defaultModelId = computed({
  get: () => activeProviderConfig.value.defaultModelId || '',
  set: (v) => {
    const id = activeProviderId.value
    if (!id) return
    activeProviderConfig.value = { ...activeProviderConfig.value, defaultModelId: v || '' }
    localStorage.setItem(`provider_${id}_config`, JSON.stringify(activeProviderConfig.value))
  }
})
const modelOptions = computed(() => Array.isArray(activeProviderConfig.value.models) ? activeProviderConfig.value.models : [])
</script>

<template>
  <div class="page-full">
    <div class="page-full-title">配置管理</div>
    <div class="page-full-body">
      <!-- 基础设置 -->
      <div class="section-group">
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

      <!-- AI 功能设置 -->
      <div class="section-group ai-section">
        <div class="section-title">AI 功能</div>
        
        <div class="ai-card">
          <div class="card-header card-header-row">
            <span>模型供应商</span>
            <div class="default-model">
              <span class="default-label">默认模型</span>
              <select class="default-select" v-model="defaultModelId">
                <option value="">暂未选择</option>
                <option v-for="m in modelOptions" :key="m.id" :value="m.id">{{ m.name || m.tag || m.id }}</option>
              </select>
            </div>
          </div>
          <div class="provider-list">
            <div v-for="p in providers" :key="p.id" class="provider-item">
              <div class="provider-info">
                <img :src="p.icon" class="provider-icon" alt="" />
                <span class="provider-name">{{ p.name }}</span>
              </div>
              <div class="provider-actions">
                <label class="switch">
                  <input type="checkbox" v-model="p.enabled">
                  <span class="slider round"></span>
                </label>
                <button class="action-btn" @click="openEditModal(p)">
                  <span class="edit-icon">✎</span> 编辑
                </button>
              </div>
            </div>
            
            <div class="add-provider">
              <span class="plus">+</span> 添加供应商
            </div>
          </div>
        </div>
      </div>

      <!-- 供应商编辑弹窗 -->
      <ProviderEditModal 
        v-if="showEditModal"
        :show="showEditModal" 
        :provider="currentProvider || {}"
        @close="showEditModal = false"
        @save="handleProviderSave"
      />
    </div>
  </div>
</template>

<style scoped>
.page-full {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}
.page-full-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
}
.page-full-body {
  flex: 1;
  padding: 24px;
  color: #333;
  overflow-y: auto;
}

.section-group {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 16px;
}
.label {
  display: block;
  color: #64748b;
  font-size: 14px;
  margin-bottom: 8px;
}
.input {
  width: 520px;
  max-width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.input:focus {
  border-color: #3b82f6;
}

/* AI Card Styles */
.ai-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  padding: 20px;
  width: 100%;
  max-width: 800px;
}

.card-header {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 16px;
}
.card-header.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.default-model {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.default-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}
.default-select {
  height: 34px;
  padding: 0 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  color: #334155;
  outline: none;
  max-width: 240px;
}
.default-select:focus {
  border-color: #8b5cf6;
}

.provider-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.provider-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 10px;
  transition: background 0.2s;
}
.provider-item:hover {
  background: #f1f5f9;
}

.provider-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.provider-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  border-radius: 4px;
}

.provider-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
}

.provider-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 6px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}
.action-btn:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.add-provider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: 1px dashed #e2e8f0;
  border-radius: 10px;
  color: #8b5cf6;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 4px;
}
.add-provider:hover {
  background: #f5f3ff;
  border-color: #ddd6fe;
}

/* Switch Component */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 22px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #e2e8f0;
  transition: .4s;
}
.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
}
input:checked + .slider {
  background-color: #8b5cf6;
}
input:checked + .slider:before {
  transform: translateX(22px);
}
.slider.round {
  border-radius: 22px;
}
.slider.round:before {
  border-radius: 50%;
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
  color: #94a3b8;
  margin-top: 6px;
  font-size: 13px;
}
.ok {
  color: #10b981;
  margin-top: 10px;
  font-size: 14px;
}
.err {
  color: #ef4444;
  margin-top: 10px;
  font-size: 14px;
}
</style>
