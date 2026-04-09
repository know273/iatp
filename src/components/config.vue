<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Toast from './ui/Toast.vue'
import questionIcon from '../assets/question-svgrepo-com.svg'
import { apiFetch } from '../utils/api'

const baseUrl = ref(localStorage.getItem('baseUrl') || '')
const baseUrlOptions = ref([])
const saving = ref(false)
const saved = ref(false)
const error = ref('')

const loadBaseUrlOptions = () => {
  let list = []
  try {
    const raw = localStorage.getItem('baseUrlOptions') || '[]'
    const parsed = JSON.parse(raw)
    list = Array.isArray(parsed) ? parsed : []
  } catch (_) {
    list = []
  }
  const cleaned = list
    .map(x => String(x || '').trim())
    .filter(Boolean)
    .map(x => x.replace(/\/$/, ''))
  const set = new Set(cleaned)
  const cur = String(baseUrl.value || '').trim().replace(/\/$/, '')
  if (cur) set.add(cur)
  baseUrlOptions.value = Array.from(set)
}

const save = async () => {
  error.value = ''
  saved.value = false
  saving.value = true
  try {
    const v = String(baseUrl.value || '').trim().replace(/\/$/, '')
    baseUrl.value = v
    localStorage.setItem('baseUrl', v)
    loadBaseUrlOptions()
    try {
      localStorage.setItem('baseUrlOptions', JSON.stringify(baseUrlOptions.value || []))
    } catch (_) {
    }
    saved.value = true
  } finally {
    saving.value = false
  }
}

const defaultModels = [
  { id: 'ds-v3', name: 'DeepSeek V3.2', tag: 'deepseek-v3-2-251201', enabled: false },
  { id: 'ds-v3-thinking', name: 'DeepSeek V3.2 Thinking', tag: 'deepseek-v3-2-251201', enabled: false },
  { id: 'db-seed-2-pro', name: 'Doubao-Seed-2.0-Pro', tag: 'doubao-seed-2-0-pro-260215', enabled: false },
  { id: 'db-seed-1-lite', name: 'Doubao-Seed-1.6-lite', tag: 'doubao-seed-1-6-lite-251015', enabled: true }
]

const storeKey = 'ai_models_config'
const models = ref([])
const activeModelKey = ref('')
const openModelId = ref('')
const suppressSync = ref(false)
const editDraft = ref(null)
const aiSaving = ref(false)
const serverSnapshot = ref(null)
let activeSyncTimer = null
const toastShow = ref(false)
const toastMsg = ref('')
const toastType = ref('success')
const apiKeyFocused = ref(false)

const showToast = (msg, type = 'success') => {
  toastMsg.value = msg || ''
  toastType.value = type
  toastShow.value = true
}

const maskApiKey = (v) => {
  const s = String(v || '')
  if (!s) return ''
  if (s.length <= 8) return '•'.repeat(s.length)
  return s.slice(0, 6) + '•'.repeat(s.length - 8) + s.slice(-2)
}

const authHeaders = () => {
  const token = localStorage.getItem('token') || ''
  if (!token) {
    error.value = '请先登录后再加载 AI 配置'
    return null
  }
  if (token.split('.').length !== 3) {
    error.value = '登录凭证无效，请重新登录'
    return null
  }
  return { Authorization: `Bearer ${token}` }
}

const apiBaseUrl = computed(() => String(import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000').replace(/\/$/, ''))

const persistModelsConfig = () => {
  localStorage.setItem(
    storeKey,
    JSON.stringify({
      activeModelKey: activeModelKey.value || '',
      models: (models.value || []).map(x => ({
        id: x.id,
        name: x.name || '',
        tag: x.tag || '',
        enabled: typeof x.enabled === 'boolean' ? x.enabled : true,
        apiKey: x.apiKey || '',
        endpoint: x.endpoint || '',
        sortOrder: Number.isFinite(x.sortOrder) ? x.sortOrder : 0
      }))
    })
  )
}

const loadModelsConfig = () => {
  const tryParse = (k) => {
    try {
      return JSON.parse(localStorage.getItem(k) || '{}')
    } catch (e) {
      return {}
    }
  }
  const cfg = tryParse(storeKey)
  const legacy = tryParse('provider_1_config')
  const list = Array.isArray(cfg.models) && cfg.models.length ? cfg.models : (Array.isArray(legacy.models) ? legacy.models : [])
  models.value = (list && list.length ? list : defaultModels).map(x => ({
    id: x.id,
    name: x.name || '',
    tag: x.tag || '',
    enabled: typeof x.enabled === 'boolean' ? x.enabled : true,
    apiKey: x.apiKey || '',
    endpoint: x.endpoint || '',
    sortOrder: Number.isFinite(x.sortOrder) ? x.sortOrder : 0
  }))
  activeModelKey.value =
    cfg.activeModelKey ||
    cfg.defaultModelId ||
    legacy.activeModelKey ||
    legacy.defaultModelId ||
    models.value.find(x => x.enabled)?.id ||
    models.value[0]?.id ||
    ''
  const enabledKeys = new Set(models.value.filter(x => x.enabled).map(x => x.id))
  if (activeModelKey.value && !enabledKeys.has(activeModelKey.value)) {
    activeModelKey.value = enabledKeys.values().next().value || ''
  }
  persistModelsConfig()
}

loadModelsConfig()

const normalizeActiveModel = () => {
  const list = models.value || []
  if (!list.length) {
    activeModelKey.value = ''
    return
  }

  if (!activeModelKey.value) {
    activeModelKey.value = list.find(x => x && x.enabled)?.id || list[0]?.id || ''
  }

  let hasActive = false
  list.forEach(x => {
    const isActive = x && x.id === activeModelKey.value
    if (isActive) hasActive = true
    if (x) x.enabled = isActive
  })

  if (!hasActive) {
    activeModelKey.value = list[0]?.id || ''
    list.forEach(x => {
      if (x) x.enabled = x.id === activeModelKey.value
    })
  }
}

const saveAiConfigToServer = async (opts = {}) => {
  const headers = authHeaders()
  if (!headers) return
  const silent = !!opts.silent
  const toast = !!opts.toast
  if (!silent) aiSaving.value = true
  try {
    const payload = {
      active_model_key: activeModelKey.value || '',
      models: (models.value || []).map((m, idx) => ({
        model_key: m.id,
        model_name: m.name || '',
        real_model_id: m.tag || '',
        enabled: !!m.enabled,
        api_key: m.apiKey || '',
        api_endpoint: m.endpoint || '',
        sort_order: Number.isFinite(m.sortOrder) ? m.sortOrder : idx
      }))
    }

    const res = await apiFetch(`${apiBaseUrl.value}/api/ai/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(payload)
      })
      if (res.status === 401) {
        if (toast) showToast('登录已失效，请重新登录', 'error')
        return
      }
      if (res.ok) {
        if (toast) showToast('已保存到数据库', 'success')
        serverSnapshot.value = JSON.parse(JSON.stringify({ activeModelKey: activeModelKey.value || '', models: models.value || [] }))
        return
      }
  } catch (e) {
  } finally {
    if (!silent) aiSaving.value = false
  }
}

const scheduleActiveSave = () => {
  if (suppressSync.value) return
  if (activeSyncTimer) clearTimeout(activeSyncTimer)
  activeSyncTimer = setTimeout(() => {
    saveAiConfigToServer({ silent: true })
  }, 300)
}

watch(models, () => {
  normalizeActiveModel()
  persistModelsConfig()
}, { deep: true })

watch(activeModelKey, () => {
  normalizeActiveModel()
  persistModelsConfig()
})

const openEditor = (m) => {
  editDraft.value = {
    id: m.id,
    name: m.name || '',
    tag: m.tag || '',
    apiKey: m.apiKey || '',
    endpoint: m.endpoint || ''
  }
  apiKeyFocused.value = false
  openModelId.value = m.id
}

const toggleModel = (m) => {
  if (openModelId.value === m.id) {
    openModelId.value = ''
    editDraft.value = null
    apiKeyFocused.value = false
    return
  }
  openEditor(m)
}

const saveEditor = async () => {
  if (!editDraft.value) return
  const d = editDraft.value
  const target = (models.value || []).find(x => x.id === d.id)
  if (target) {
    target.name = d.name || ''
    target.tag = d.tag || ''
    target.apiKey = d.apiKey || ''
    target.endpoint = d.endpoint || ''
  }
  editDraft.value = null
  apiKeyFocused.value = false
  openModelId.value = ''
  await saveAiConfigToServer({ toast: true })
}

const cancelEditor = () => {
  editDraft.value = null
  apiKeyFocused.value = false
  openModelId.value = ''
}

const revertAiConfig = () => {
  if (!serverSnapshot.value) return
  suppressSync.value = true
  try {
    const snap = JSON.parse(JSON.stringify(serverSnapshot.value))
    models.value = Array.isArray(snap.models) ? snap.models : []
    activeModelKey.value = snap.activeModelKey || ''
    normalizeActiveModel()
    persistModelsConfig()
  } finally {
    suppressSync.value = false
  }
  editDraft.value = null
  apiKeyFocused.value = false
  openModelId.value = ''
}
const removeModel = async (m) => {
  models.value = models.value.filter(x => x.id !== m.id)
  if (activeModelKey.value === m.id) normalizeActiveModel()
  await saveAiConfigToServer({ silent: true })
}
const addModel = () => {
  const id = `custom-${Date.now()}`
  const nextSort = (models.value || []).length
  models.value = [...models.value, { id, name: '', tag: '', enabled: false, apiKey: '', endpoint: '', sortOrder: nextSort }]
  openEditor(models.value[models.value.length - 1])
}

const loadFromServer = async () => {
  const headers = authHeaders()
  if (!headers) return
  try {
    let data = null
    const res = await apiFetch(`${apiBaseUrl.value}/api/ai/config`, { method: 'GET', headers: { ...headers } })
      if (res.status === 401) {
        error.value = '登录已失效，请重新登录'
        return
      }
      if (!res.ok) return
      data = await res.json()
    if (!data) return
    const incoming = Array.isArray(data.models) ? data.models : []
    suppressSync.value = true
    models.value = incoming.map((m, idx) => ({
      id: m.model_key,
      name: m.model_name || '',
      tag: m.real_model_id || '',
      enabled: !!m.enabled,
      apiKey: m.api_key || '',
      endpoint: m.api_endpoint || '',
      sortOrder: Number.isFinite(m.sort_order) ? m.sort_order : idx
    }))
    activeModelKey.value = data.active_model_key || ''
    normalizeActiveModel()
    persistModelsConfig()
    serverSnapshot.value = JSON.parse(JSON.stringify({ activeModelKey: activeModelKey.value || '', models: models.value || [] }))
  } finally {
    suppressSync.value = false
  }
}

onMounted(() => {
  loadBaseUrlOptions()
  loadFromServer()
})
</script>

<template>
  <div class="page-full">
    <Toast v-model:show="toastShow" :message="toastMsg" :type="toastType" />
    <div class="page-full-title">配置管理</div>
    <div class="page-full-body">
      <!-- 基础设置 -->
      <div class="section-group">
        <div class="form-item">
          <div class="label-row">
            <label class="label">base_url</label>
            <img class="help-icon" :src="questionIcon" alt="帮助" title="生成用例时会拼接为完整请求URL：base_url + 请求URL" />
          </div>
          <input class="input" v-model="baseUrl" list="baseurl-options" placeholder="例如: http://127.0.0.1:5000" />
          <datalist id="baseurl-options">
            <option v-for="opt in baseUrlOptions" :key="opt" :value="opt">{{ opt }}</option>
          </datalist>
        </div>
        <div class="btns">
          <button class="btn primary" :disabled="saving" @click="save">{{ saving ? '保存中' : '保存' }}</button>
        </div>
        <div class="ok" v-if="saved">已保存</div>
        <div class="err" v-if="error">{{ error }}</div>
      </div>

      <!-- AI 功能设置 -->
      <div class="section-group ai-section">
        <div class="section-title">AI 功能</div>
        
        <div class="ai-card">
          <div class="card-header card-header-row">
            <span>模型列表</span>
            <div class="default-model" v-if="models.length">
              <span class="default-label">启用模型</span>
              <select class="default-select" v-model="activeModelKey" @change="scheduleActiveSave">
                <option value="">暂未选择</option>
                <option v-for="m in models" :key="m.id" :value="m.id">{{ m.name || m.tag || m.id }}</option>
              </select>
            </div>
          </div>
          <div class="model-list">
            <div v-for="m in models" :key="m.id" class="model-row">
              <div class="model-item">
                <div class="model-left">
                  <label class="switch sm">
                    <input type="checkbox" :checked="activeModelKey === m.id" @change="() => { activeModelKey = m.id; scheduleActiveSave() }">
                    <span class="slider round"></span>
                  </label>
                  <span class="model-name">{{ m.name || '未命名模型' }}</span>
                  <span v-if="m.tag" class="model-tag">{{ m.tag }}</span>
                </div>
                <div class="model-right">
                  <button class="icon-btn" @click.stop="removeModel(m)" type="button" aria-label="删除模型">×</button>
                  <span class="chevron" :class="{ open: openModelId === m.id }" @click.stop="toggleModel(m)">›</span>
                </div>
              </div>
              <div v-if="openModelId === m.id" class="model-expand">
                <div class="form-item">
                  <label class="label">模型名称</label>
                  <input class="input" v-model="editDraft.name" placeholder="输入模型名称" />
                </div>
                <div class="form-item">
                  <label class="label">模型 ID</label>
                  <input class="input" v-model="editDraft.tag" placeholder="输入模型 ID" />
                </div>
                <div class="form-item">
                  <div class="label-row">
                    <label class="label">API Key</label>
                    <a class="label-link" href="https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey" target="_blank" rel="noopener noreferrer">获取 API Key ↗</a>
                  </div>
                  <input
                    class="input"
                    autocomplete="new-password"
                    :value="apiKeyFocused ? editDraft.apiKey : maskApiKey(editDraft.apiKey)"
                    @focus="apiKeyFocused = true"
                    @blur="apiKeyFocused = false"
                    @input="(e) => (editDraft.apiKey = e.target.value)"
                    placeholder="请输入 API Key"
                  />
                </div>
                <div class="form-item">
                  <label class="label">API 前置 URL</label>
                  <input class="input" v-model="editDraft.endpoint" placeholder="请输入 API 前置 URL" />
                </div>

                <div class="edit-actions">
                  <button class="btn primary" type="button" :disabled="aiSaving" @click="saveEditor">{{ aiSaving ? '保存中' : '保存' }}</button>
                  <button class="btn" type="button" :disabled="aiSaving" @click="cancelEditor">取消</button>
                  <button class="btn" type="button" :disabled="aiSaving || !serverSnapshot" @click="revertAiConfig">撤销全部修改</button>
                </div>
              </div>
            </div>

            <button class="add-model-btn" type="button" @click="addModel">
              <span class="plus">+</span> 添加模型
            </button>
          </div>
        </div>
      </div>
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
.label-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  margin-bottom: 6px;
}
.label-row .label {
  margin-bottom: 0;
}
.label {
  display: block;
  color: #64748b;
  font-size: 14px;
  margin-bottom: 8px;
}
.label-link {
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  color: #8b5cf6;
  font-weight: 500;
  text-decoration: none;
}
.label-link:hover {
  text-decoration: underline;
}
.help-icon {
  width: 16px;
  height: 16px;
  opacity: 0.75;
  cursor: help;
}
.help-icon:hover {
  opacity: 1;
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

.model-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.model-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.model-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  transition: all 0.2s;
}
.model-item:hover {
  border-color: #e2e8f0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.model-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}
.model-name {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  white-space: nowrap;
}
.model-tag {
  font-size: 12px;
  color: #82b6e9;
  background: #f8fafc;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
}
.model-right {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.icon-btn {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  background: transparent;
  border-radius: 8px;
  color: #94a3b8;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}
.icon-btn:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #64748b;
}
.chevron {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 18px;
  color: #94a3b8;
  font-weight: 300;
  cursor: pointer;
  user-select: none;
  transition: transform 0.2s, background 0.2s, color 0.2s;
}
.chevron:hover {
  background: #f8fafc;
  color: #64748b;
}
.chevron.open {
  transform: rotate(90deg);
}
.model-expand {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 18px 16px 2px;
}
.edit-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 4px 0 16px;
}
.ok.inline {
  margin-left: 4px;
  padding: 0;
  background: transparent;
}
.add-model-btn {
  display: flex;
  width: fit-content;
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  font-size: 13px;
  cursor: pointer;
  margin-top: 8px;
  transition: all 0.2s;
}
.add-model-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}
.switch.sm {
  width: 36px;
  height: 18px;
}
.switch.sm .slider:before {
  height: 12px;
  width: 12px;
  left: 3px;
  bottom: 3px;
}
.switch.sm input:checked + .slider:before {
  transform: translateX(18px);
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
  background: #8b5cf6;
  border-color: #8b5cf6;
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
