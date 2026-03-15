<script setup>
import { ref, computed, watch } from 'vue'
import Modal from './ui/Modal.vue'
import deleteIcon from '../assets/delete-1-svgrepo-com.svg'

const props = defineProps({
  show: { type: Boolean, default: false },
  provider: { type: Object, default: () => ({}) }
})
const emit = defineEmits(['close', 'save'])

const config = ref({})

const isVolc = computed(() => props.provider?.name === '火山引擎')
const isTencent = computed(() => props.provider?.name === '腾讯云')

const volcModels = ref([
  { id: 'ds-v3', name: 'DeepSeek V3.2', tag: 'deepseek-v3-2-251201', recommended: true, enabled: false, open: false, icon: 'https://chat.deepseek.com/favicon.svg' },
  { id: 'ds-v3-thinking', name: 'DeepSeek V3.2 Thinking', tag: 'deepseek-v3-2-251201', enabled: false, open: false, icon: 'https://chat.deepseek.com/favicon.svg' },
  { id: 'db-seed-2-pro', name: 'Doubao-Seed-2.0-Pro', tag: 'doubao-seed-2-0-pro-260215', enabled: false, open: false, icon: 'https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/34966601f07f4347916960810486f03e~tplv-k3u1fbpfcp-zoom-1.image' },
  { id: 'db-seed-1-lite', name: 'Doubao-Seed-1.6-lite', tag: 'doubao-seed-1-6-lite-251015', enabled: true, open: false, icon: 'https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/34966601f07f4347916960810486f03e~tplv-k3u1fbpfcp-zoom-1.image' }
])
const defaultModelId = ref('')

watch(() => props.provider, (p) => {
  if (p && p.id) {
    const saved = JSON.parse(localStorage.getItem(`provider_${p.id}_config`) || '{}')
    config.value = { ...saved }
    defaultModelId.value = saved.defaultModelId || ''
    const savedModels = Array.isArray(saved.models) ? saved.models : []
    if (savedModels.length) {
      volcModels.value = volcModels.value.map(m => {
        const hit = savedModels.find(x => x && x.id === m.id)
        if (!hit) return m
        return {
          ...m,
          enabled: typeof hit.enabled === 'boolean' ? hit.enabled : m.enabled,
          name: typeof hit.name === 'string' ? hit.name : m.name,
          tag: typeof hit.tag === 'string' ? hit.tag : m.tag
        }
      })
    }
  }
}, { immediate: true })

const toggleDefaultModel = (m, e) => {
  const checked = !!e?.target?.checked
  defaultModelId.value = checked ? m.id : ''
}

const toggleModel = (m) => {
  m.open = !m.open
}
const removeModel = (m) => {
  volcModels.value = volcModels.value.filter(x => x.id !== m.id)
  if (defaultModelId.value === m.id) defaultModelId.value = ''
}
const addModel = () => {
  volcModels.value.forEach(x => { x.open = false })
  const id = `custom-${Date.now()}`
  volcModels.value.push({
    id,
    name: '',
    tag: '',
    enabled: true,
    open: true,
    icon: '',
    recommended: false
  })
  defaultModelId.value = id
}

const handleConfirm = () => {
  if (!props.provider || !props.provider.id) {
    emit('close')
    return
  }
  config.value = { ...config.value, defaultModelId: defaultModelId.value || '', models: volcModels.value.map(x => ({ id: x.id, name: x.name, tag: x.tag, enabled: x.enabled })) }
  localStorage.setItem(`provider_${props.provider.id}_config`, JSON.stringify(config.value))
  emit('save', { ...props.provider, config: config.value })
  emit('close')
}
</script>

<template>
  <Modal :show="show" :title="`编辑供应商: ${provider?.name}`" width="800px" @close="emit('close')" @confirm="handleConfirm">
    <div class="edit-form">
      <!-- 共享配置 -->
      <div class="form-group">
        <div class="label-row">
          <label class="form-label">供应商名称</label>
        </div>
        <input class="form-input" :value="provider?.name || ''" disabled />
      </div>

      <!-- 火山引擎专属配置 -->
      <template v-if="isVolc">
        <div class="form-group">
          <div class="label-row">
            <label class="form-label">API Key</label>
            <a href="https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey" target="_blank" class="label-link">获取 API Key ↗</a>
          </div>
          <input class="form-input" v-model="config.ak" type="password" placeholder="请输入火山引擎 Access Key" />
        </div>
        <div class="form-group">
          <div class="label-row">
            <label class="form-label">API 前置 URL</label>
            <a href="https://console.volcengine.com/ark/region:ark+cn-beijing/openManagement" target="_blank" class="label-link">获取 API 前置 URL ↗</a>
          </div>
          <input class="form-input" v-model="config.sk" type="password" placeholder="请输入火山引擎 Secret Key" />
        </div>
        <div class="form-group">
          <div class="label-row">
            <label class="form-label">模型列表</label>
          </div>
          <div class="model-list">
            <div v-for="m in volcModels" :key="m.id" class="model-row">
              <div class="model-item">
                <div class="model-left">
                  <label class="switch sm">
                    <input type="checkbox" :checked="defaultModelId === m.id" @change="(e) => toggleDefaultModel(m, e)">
                    <span class="slider round"></span>
                  </label>
                <div class="model-icon-box">
                  <img v-if="m.icon" :src="m.icon" class="model-icon" alt="" />
                  <span v-else class="model-icon-placeholder"></span>
                </div>
                <span class="model-name">{{ m.name || (defaultModelId === m.id ? '已选中' : '未选择') }}</span>
                <span v-if="m.tag" class="model-tag">{{ m.tag }}</span>
                  <span v-if="m.recommended" class="recommend-tag">推荐</span>
                </div>
                <div class="model-right">
                  <button class="icon-btn" @click.stop="removeModel(m)" type="button" aria-label="删除模型">
                    <img :src="deleteIcon" class="icon-img" alt="" />
                  </button>
                  <span class="chevron" :class="{ open: m.open }" @click.stop="toggleModel(m)">›</span>
                </div>
              </div>
              <div v-if="m.open" class="model-expand">
                <div class="form-group">
                  <div class="label-row">
                    <label class="form-label">模型名称<span class="req">*</span></label>
                  </div>
                  <input class="form-input" v-model="m.name" placeholder="输入模型的名称，例如： DeepSeek Reasoner 或 DeepSeek Chat" />
                </div>
                <div class="form-group">
                  <div class="label-row">
                    <label class="form-label">模型 ID<span class="req">*</span></label>
                  </div>
                  <input class="form-input" v-model="m.tag" placeholder="输入模型 ID，例如： deepseek-reasoner 或 deepseek-chat" />
                </div>
              </div>
            </div>
            
            <button class="add-model-btn" type="button" @click="addModel">
              <span class="plus">+</span> 添加模型
            </button>
          </div>
        </div>
      </template>

      <!-- 腾讯云专属配置 -->
      <template v-if="isTencent">
        <div class="form-group">
          <div class="label-row">
            <label class="form-label">API Key</label>
            <a href="https://console.cloud.tencent.com/cam/capi" target="_blank" class="label-link">获取 API Key ↗</a>
          </div>
          <input class="form-input" v-model="config.secretId" type="password" placeholder="请输入腾讯云 SecretId" />
        </div>
        <div class="form-group">
          <div class="label-row">
            <label class="form-label">API 前置 URL</label>
            <a href="https://console.cloud.tencent.com/cam/capi" target="_blank" class="label-link">获取 API 前置 URL ↗</a>
          </div>
          <input class="form-input" v-model="config.secretKey" type="password" placeholder="请输入腾讯云 SecretKey" />
        </div>
        <div class="form-group">
          <div class="label-row">
            <label class="form-label">模型版本</label>
          </div>
          <select class="form-select" v-model="config.model">
            <option value="hunyuan-pro">hunyuan-pro</option>
            <option value="hunyuan-standard">hunyuan-standard</option>
            <option value="hunyuan-lite">hunyuan-lite</option>
          </select>
        </div>
      </template>

      <!-- 通用兜底 -->
      <template v-if="!isVolc && !isTencent">
        <div class="form-group">
          <div class="label-row">
            <label class="form-label">API 前置 URL</label>
          </div>
          <input class="form-input" v-model="config.endpoint" placeholder="请输入 API Endpoint" />
        </div>
        <div class="form-group">
          <div class="label-row">
            <label class="form-label">API Key</label>
            <a href="javascript:void(0)" class="label-link">获取 API Key ↗</a>
          </div>
          <input class="form-input" v-model="config.apiKey" type="password" placeholder="请输入 API Key" />
        </div>
      </template>
    </div>
  </Modal>
</template>

<style scoped>
.edit-form {
  display: flex;
  flex-direction: column;
}

.model-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
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
  cursor: default;
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

.model-icon-box {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.model-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.model-icon-placeholder {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: #e2e8f0;
  display: inline-block;
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

.recommend-tag {
  font-size: 11px;
  color: #f97316;
  background: #fff7ed;
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
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
}
.icon-btn:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
  color: #64748b;
}
 
.icon-img {
  width: 16px;
  height: 16px;
  display: block;
  opacity: 0.55;
}
.icon-btn:hover .icon-img {
  opacity: 0.85;
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

.req {
  color: #ef4444;
  margin-left: 4px;
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

/* 小号开关样式 */
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

/* 复用 Modal 中的基础开关逻辑，确保 sm 类生效 */
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
  border-radius: 22px;
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
  border-radius: 50%;
}
input:checked + .slider {
  background-color: #8b5cf6;
}
input:checked + .slider:before {
  transform: translateX(22px);
}
</style>
