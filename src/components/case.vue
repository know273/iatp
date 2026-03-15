<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import CollapseCard from './ui/CollapseCard.vue'
import Pagination from './ui/Pagination.vue'
import Toast from './ui/Toast.vue'
import caretBottom from '../assets/caret-bottom-svgrepo-com.svg'
import bookOpen from '../assets/book-open-svgrepo-com.svg'
import circleCross from '../assets/circle-cross-svgrepo-com.svg'

const apiUrl = ref('')
const apiFile = ref(null)
const apiFileInput = ref(null)
const outputName = ref('autointerface_test_cases')
const genOpen = ref(true)
const uploadOpen = ref(true)
const filesOpen = ref(true)
const tplOpen = ref(true)
const generating = ref(false)
const genError = ref('')
const apiBase = computed(() => import.meta.env.VITE_API_BASE || localStorage.getItem('apiBase') || 'http://127.0.0.1:5000')

const onPickFile = (e) => {
  const f = e.target.files && e.target.files[0]
  apiFile.value = f || null
}
const clearApiFile = () => {
  apiFile.value = null
  if (apiFileInput.value) apiFileInput.value.value = ''
}
const upFile = ref(null)
const upFileInput = ref(null)
const onPickUpload = (e) => {
  const f = e.target.files && e.target.files[0]
  upFile.value = f || null
}
const clearUpFile = () => {
  upFile.value = null
  if (upFileInput.value) upFileInput.value.value = ''
}
const toAbsUrl = (base, rel) => {
  const p = String(rel || '').replace(/^\\+|^\/+/, '').replace(/\\/g, '/')
  return base.replace(/\/$/, '') + '/' + p
}
const baseName = (p) => {
  const segs = String(p).split(/[\\\/]/)
  return segs[segs.length - 1] || p
}
const genFromApiDoc = async () => {
  //为“输出文件名”添加了校验逻辑。
  const reg = /^[a-zA-Z0-9_]+$/
  if (!reg.test(outputName.value)) {
    toastType.value = 'error'
    toastMsg.value = '仅支持大小写英文、数字、下划线组合'
    toastShow.value = true
    return
  }
  genError.value = ''
  if (!apiFile.value && !apiUrl.value) {
    genError.value = '请选择文件或输入URL'
    return
  }
  generating.value = true
  try {
    const fd = new FormData()
    fd.append('output_name', outputName.value || 'autointerface_test_cases')
    if (apiFile.value) fd.append('file', apiFile.value)
    if (apiUrl.value) fd.append('doc_url', apiUrl.value)
    const res = await fetch(`${apiBase.value}/api/cases/generate-from-doc`, {
      method: 'POST',
      body: fd
    })
    if (!res.ok) throw new Error('生成失败')
    const data = await res.json()
    const path = data.file_path || data.file_name || ''
    const item = {
      name: baseName(path || outputName.value + '.csv'),
      url: path ? toAbsUrl(apiBase.value, path) : '',
      type: 'CSV',
      size: data.size || '未知',
      time: data.time || new Date().toISOString().replace('T',' ').slice(0,19)
    }
    uploadedFiles.value.unshift(item)
    toastType.value = 'success'
    toastMsg.value = '生成成功'
    toastShow.value = true
  } catch (e) {
    genError.value = '生成失败'
  } finally {
    generating.value = false
  }
}
const toggleGen = () => {
  genOpen.value = !genOpen.value
}
const toggleUpload = () => {
  uploadOpen.value = !uploadOpen.value
}
const toggleFiles = () => {
  filesOpen.value = !filesOpen.value
}
const toggleTpl = () => {
  tplOpen.value = !tplOpen.value
}

const uploadedFiles = ref([])
const pageSize = 10
const currentPage = ref(1)
const totalItems = computed(() => uploadedFiles.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / pageSize)))
const displayedFiles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return uploadedFiles.value.slice(start, start + pageSize)
})
const visiblePages = computed(() => {
  const tp = totalPages.value
  if (tp <= 4) return Array.from({ length: tp }, (_, i) => i + 1)
  let start = Math.max(1, currentPage.value - 1)
  if (start + 3 > tp) start = tp - 3
  return [start, start + 1, start + 2, start + 3]
})
const gotoPage = (p) => {
  if (p < 1 || p > totalPages.value) return
  currentPage.value = p
}
const prevPage = () => gotoPage(currentPage.value - 1)
const nextPage = () => gotoPage(currentPage.value + 1)
const loadFiles = async () => {
  try {
    const res = await fetch(`${apiBase.value}/api/cases/files`)
    if (!res.ok) return
    const data = await res.json()
    const files = Array.isArray(data.files) ? data.files : []
    uploadedFiles.value = files.map(x => ({
      name: x.file_name || '',
      type: 'CSV',
      size: x.size || '',
      time: x.time || '',
      url: toAbsUrl(apiBase.value, x.file_path || '')
    }))
    currentPage.value = 1
  } catch (_) {
  }
}
onMounted(loadFiles)
watch(uploadedFiles, () => {
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value
})
const downloadFile = (f) => {
  if (f && f.url) window.open(f.url, '_blank')
}
const deleteFile = (f) => {
  uploadedFiles.value = uploadedFiles.value.filter(x => x !== f)
}
const toastShow = ref(false)
const toastMsg = ref('')
const toastType = ref('success')
const uploading = ref(false)
const uploadError = ref('')
const uploadCase = async () => {
  uploadError.value = ''
  if (!upFile.value) {
    uploadError.value = '请选择文件'
    return
  }
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', upFile.value)
    const res = await fetch(`${apiBase.value}/api/cases/upload`, {
      method: 'POST',
      body: fd
    })
    if (!res.ok) throw new Error('上传失败')
    await loadFiles()
    upFile.value = null
    toastType.value = 'success'
    toastMsg.value = '上传成功'
    toastShow.value = true
  } catch (e) {
    uploadError.value = '上传失败'
  } finally {
    uploading.value = false
  }
}

const columns = ref([
  { name: '接口名称', required: true, desc: '接口名称', example: '' },
  { name: '用例描述', required: false, desc: '用例描述', example: '' },
  { name: '执行阶段', required: false, desc: '执行阶段', example: '' },
  { name: '操作步骤', required: false, desc: '操作步骤', example: '' },
  { name: '预期结果', required: false, desc: '预期结果', example: '' },
  { name: '优先级', required: false, desc: '优先级', example: '' },
  { name: '标签', required: false, desc: '标签', example: '' },
  { name: '请求方法', required: true, desc: '请求方法', example: '' },
  { name: '请求URL', required: true, desc: '请求URL', example: '' },
  { name: '请求头', required: false, desc: '请求头', example: '' },
  { name: '请求参数', required: false, desc: '请求参数', example: '' },
  { name: '请求体', required: false, desc: '请求体', example: '' },
  { name: '预期状态码', required: false, desc: '预期状态码', example: '' },
  { name: '预期响应', required: false, desc: '预期响应', example: '' },
  { name: '验证点', required: false, desc: '验证点', example: '' },
  { name: '前置条件', required: false, desc: '前置条件', example: '' },
  { name: '创建人', required: false, desc: '创建人', example: '' },
  { name: '创建时间', required: false, desc: '创建时间', example: '' },
  { name: '最后更新人', required: false, desc: '最后更新人', example: '' },
  { name: '最后更新时间', required: false, desc: '最后更新时间', example: '' },
  { name: '备注', required: false, desc: '备注', example: '' }
])
const moveUp = (idx) => {
  if (idx <= 0) return
  const arr = columns.value
  const t = arr[idx - 1]
  arr[idx - 1] = arr[idx]
  arr[idx] = t
}
const moveDown = (idx) => {
  const arr = columns.value
  if (idx >= arr.length - 1) return
  const t = arr[idx + 1]
  arr[idx + 1] = arr[idx]
  arr[idx] = t
}
const removeCol = (idx) => {
  columns.value.splice(idx, 1)
}
const addCol = () => {
  columns.value.push({ name: '新列', required: false, desc: '新列描述', example: '' })
}
const downloadCsvTpl = () => {
  alert('下载CSV模板')
}
</script>

<template>
  <div class="case-page">
    <Toast v-model:show="toastShow" :message="toastMsg" :type="toastType" />
    <div class="case-header">用例管理</div>
    <div class="case-desc">管理测试用例文件，支持上传、查看和编辑测试用例</div>

    <section class="card">
      <div class="card-title title-fit" @click="toggleGen">
        从API文档生成测试用例
        <span class="arrow" aria-hidden="true">
          <img v-if="genOpen" class="arrow-icon" :src="caretBottom" width="16" height="16" alt="向下" />
          <img v-else class="arrow-icon" :src="caretBottom" width="16" height="16" style="transform: rotate(-90deg);" alt="向右" />
        </span>
      </div>
      <div v-show="genOpen" class="card-body">
        <div class="form-item">
          <label class="label">API文档URL</label>
          <input class="input" v-model="apiUrl" placeholder="例如: https://api.example.com/swagger.json" />
        </div>
        <div class="form-item">
          <label class="label">API文档文件</label>
          <div class="file-line">
            <label class="btn upload">
              选择文件
              <input ref="apiFileInput" class="hidden-file" type="file" accept=".json,.yaml,.yml" @change="onPickFile" />
            </label>
            <div class="file-info-wrap">
              <span class="file-name">{{ apiFile ? apiFile.name : '未选择任何文件' }}</span>
              <img v-if="apiFile" :src="circleCross" class="clear-icon" @click="clearApiFile" alt="清除" />
            </div>
          </div>
        </div>
        <div class="tips">
          支持Swagger/OpenAPI格式
          <div class="doc-link-wrap">
            <img :src="bookOpen" class="book-icon" width="16" height="16" alt="" />
            <a class="doc-link" href="javascript:void(0)">查看API文档格式说明</a>
          </div>
        </div>
        <div class="form-item">
          <label class="label">输出文件名</label>
          <input class="input" v-model="outputName" />
        </div>
        <div>
          <button class="btn primary" @click="genFromApiDoc">生成测试用例</button>
        </div>
        <div class="gen-status" v-if="generating">
          <div class="spinner"></div>
          <span class="gen-text">生成中</span>
        </div>
        <div class="gen-error" v-if="genError">{{ genError }}</div>
      </div>
    </section>

    <section class="card">
      <div class="card-title title-fit" @click="toggleUpload">
        上传测试用例
        <span class="arrow" aria-hidden="true">
          <img v-if="uploadOpen" class="arrow-icon" :src="caretBottom" width="16" height="16" alt="向下" />
          <img v-else class="arrow-icon" :src="caretBottom" width="16" height="16" style="transform: rotate(-90deg);" alt="向右" />
        </span>
      </div>
      <div v-show="uploadOpen" class="card-body">
        <div class="form-item">
          <label class="label">选择文件</label>
          <div class="file-line">
            <label class="btn upload">
              选择文件
              <input ref="upFileInput" class="hidden-file" type="file" accept=".json,.xlsx,.csv" @change="onPickUpload" />
            </label>
            <div class="file-info-wrap">
              <span class="file-name">{{ upFile ? upFile.name : '未选择任何文件' }}</span>
              <img v-if="upFile" :src="circleCross" class="clear-icon" @click="clearUpFile" alt="清除" />
            </div>
          </div>
        </div>
        <div>
          <button class="btn primary" :disabled="uploading" @click="uploadCase">{{ uploading ? '上传中' : '上传' }}</button>
          <span class="gen-error" v-if="uploadError" style="margin-left:8px">{{ uploadError }}</span>
        </div>
      </div>
    </section>

    <CollapseCard v-model="filesOpen" title="测试用例文件">
        <table class="table">
          <thead>
            <tr>
              <th>文件名</th>
              <th>文件类型</th>
              <th>大小</th>
              <th>修改时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in displayedFiles" :key="f.name">
              <td>{{ f.name }}</td>
              <td>{{ f.type }}</td>
              <td>{{ f.size }}</td>
              <td>{{ f.time }}</td>
              <td>
                <button class="btn sm success" @click="downloadFile(f)">下载</button>
                <button class="btn sm danger" @click="deleteFile(f)">删除</button>
              </td>
            </tr>
            <tr v-if="uploadedFiles.length === 0">
              <td colspan="5" class="empty">暂无文件</td>
            </tr>
          </tbody>
        </table>
        <Pagination v-model="currentPage" :total="totalItems" :page-size="pageSize" />
      </CollapseCard>

    <CollapseCard v-model="tplOpen" title="用例模板">
        <div class="tool-line">
          <button class="btn primary" @click="downloadCsvTpl">下载CSV模板</button>
          <button class="btn success" @click="addCol">新增列</button>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>列名</th>
              <th>必填</th>
              <th>描述</th>
              <th>示例</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(col, idx) in columns" :key="col.name + idx">
              <td class="col-name">{{ col.name }}</td>
              <td>{{ col.required ? '是' : '否' }}</td>
              <td>{{ col.desc }}</td>
              <td class="example">{{ col.example }}</td>
              <td>
                <button class="btn sm warn" @click="moveUp(idx)">上移</button>
                <button class="btn sm warn" @click="moveDown(idx)">下移</button>
                <button class="btn sm danger" @click="removeCol(idx)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </CollapseCard>
  </div>
</template>

<style scoped>
.case-page {
  width: 100%;
  height: 100%;
  padding: 16px;
  background: linear-gradient(180deg, #f5f8ff 0%, #f7fbff 100%);
  box-sizing: border-box;
  text-align: left;
}
.case-header {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
  text-align: left;
}
.case-desc {
  color: #666;
  margin-bottom: 16px;
  text-align: left;
}
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
.form-item {
  margin-bottom: 14px;
  text-align: left;
}
.label {
  display: block;
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
  text-align: left;
}
.input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}
.input:focus {
  border-color: #1e50c8;
}
.file-line {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  padding: 4px 8px;
  width: 100%;
}
.btn {
  height: 36px;
  padding: 0 14px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #f9f9f9;
  cursor: pointer;
  font-size: 14px;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn.primary {
  color: #fff;
  background: linear-gradient(90deg, #1e50c8 0%, #3a78f4 100%);
  border-color: #1e50c8;
}
.btn.upload {
  position: relative;
  overflow: hidden;
}
.hidden-file {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
.file-name {
  color: #999;
  font-size: 14px;
}
.file-info-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}
.clear-icon {
  width: 16px;
  height: 16px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.clear-icon:hover {
  opacity: 1;
}
.tips {
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 14px;
}
.doc-link {
  color: #1e50c8;
  text-decoration: underline;
}
.doc-link-wrap {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.book-icon {
  width: 16px;
  height: 16px;
  display: inline-block;
}
.gen-status {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #3a78f4;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.gen-text {
  color: #3a78f4;
  font-size: 14px;
}
.gen-error {
  color: #ff4d4f;
  font-size: 14px;
  margin-top: 8px;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  margin-top: 8px;
}
.table th, .table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
  text-align: left;
  font-size: 14px;
}
.table thead th {
  background: #fafafa;
  font-weight: 600;
}
.tool-line {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}
.btn.sm {
  height: 28px;
  padding: 0 10px;
  font-size: 13px;
}
.btn.success {
  color: #fff;
  background: #2DB36A;
  border-color: #2DB36A;
}
.btn.danger {
  color: #fff;
  background: #ff4d4f;
  border-color: #ff4d4f;
}
.btn.warn {
  color: #fff;
  background: #f0ad4e;
  border-color: #f0ad4e;
}
.col-name {
  background: #f3f8ff;
}
.example {
  background: #fff7e6;
}
</style>
