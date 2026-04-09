<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Toast from './ui/Toast.vue'
import Pagination from './ui/Pagination.vue'
import IconButton from './ui/IconButton.vue'
import TaskCard from './ui/TaskCard.vue'
import checkIcon from '../assets/check.svg'
import deleteIcon from '../assets/delete.svg'
import { apiFetch } from '../utils/api'

const apiBase = computed(() => import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000')
const baseUrl = computed(() => localStorage.getItem('baseUrl') || '')
const toAbsUrl = (base, rel) => {
  const p = String(rel || '').replace(/^\\+|^\/+/, '').replace(/\\/g, '/')
  return `${String(base).replace(/\/$/, '')}/${p}`
}

const files = ref([])
const selectedFile = ref(files.value[0] || '')
const env = ref('test')
const running = ref(false)
const success = ref(false)
const taskId = ref('')
const taskStatus = ref('')
const taskProgress = ref(0)
const taskError = ref('')
const toastShow = ref(false)
const toastMsg = ref('')
const toastType = ref('success')
const history = ref([])
const router = useRouter()
const currentPage = ref(1)
const pageSize = 10
const totalItems = computed(() => history.value.length)
const pagedHistory = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return history.value.slice(start, start + pageSize)
})

const formatTime = (d) => {
  const pad = (n) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  const ss = pad(d.getSeconds())
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
}
const formatForName = (d) => {
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}
const baseName = (p) => {
  const segs = String(p).split(/[\\\/]/)
  return segs[segs.length - 1] || ''
}

const startRun = async () => {
  if (!selectedFile.value) return
  if (!baseUrl.value) return
  running.value = true
  success.value = false
  taskError.value = ''
  taskProgress.value = 0
  try {
    const body = {
      file_name: selectedFile.value,
      env: env.value,
      base_url: baseUrl.value
    }
    const res = await apiFetch(`${apiBase.value}/api/execute/run-async`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (res.status !== 202 && res.status !== 409) throw new Error('执行失败')
    const data = await res.json()
    taskId.value = data.task_id || ''
    taskStatus.value = data.status || ''
    if (!taskId.value) throw new Error('任务创建失败')
    let guard = 0
    while (guard < 1200) {
      guard += 1
      const st = await apiFetch(`${apiBase.value}/api/tasks/${encodeURIComponent(taskId.value)}`)
      if (!st.ok) throw new Error('获取任务状态失败')
      const sdata = await st.json()
      taskStatus.value = sdata.status || ''
      taskProgress.value = Number(sdata.progress) || 0
      taskError.value = sdata.error || ''
      if (taskStatus.value === 'done') {
        const result = sdata.result || {}
        const nowText = result.createdAt || formatTime(new Date())
        history.value.unshift({
          executedAt: nowText,
          fileName: selectedFile.value,
          reportName: result.report_name || sdata.report_name || '',
          total: result.total || '',
          passed: result.passed || '',
          failed: result.failed || '',
          passRate: result.pass_rate || '',
          reportUrl: ''
        })
        success.value = true
        toastType.value = 'success'
        toastMsg.value = '执行成功'
        toastShow.value = true
        break
      }
      if (taskStatus.value === 'failed') {
        throw new Error(taskError.value || '执行失败')
      }
      await new Promise((r) => setTimeout(r, 800))
    }
  } catch (e) {
    success.value = false
    toastType.value = 'error'
    toastMsg.value = String(e && e.message ? e.message : '执行失败')
    toastShow.value = true
  } finally {
    running.value = false
  }
}

const clearHistory = () => {
  history.value = []
  currentPage.value = 1
}
const viewReport = async (item) => {
  try {
    const res = await apiFetch(`${apiBase.value}/api/reports/report/exists?report_name=${encodeURIComponent(item.reportName)}`)
    const data = await res.json()
    if (!data.exists) {
      toastType.value = 'error'
      toastMsg.value = '已删除'
      toastShow.value = true
      return
    }
  } catch (_) {
  }
  router.push({ path: '/main/report', query: { name: item.reportName } })
}

const loadFiles = async () => {
  try {
    const res = await apiFetch(`${apiBase.value}/api/cases/files`)
    if (!res.ok) return
    const data = await res.json()
    const arr = Array.isArray(data.files) ? data.files : []
    files.value = arr
      .map(x => x.file_name || '')
      .filter(Boolean)
      .filter(x => String(x).toLowerCase().endsWith('.csv'))
    selectedFile.value = files.value[0] || ''
  } catch (_) {}
}
const loadHistory = async () => {
  try {
    const res = await apiFetch(`${apiBase.value}/api/reports/history/files`)
    if (!res.ok) return
    const data = await res.json()
    const arr = Array.isArray(data.reports) ? data.reports : []
    history.value = arr.map(x => ({
      executedAt: x.createdAt,
      fileName: x.file_name || '',
      reportName: x.report_name,
      total: x.total || '',
      passed: x.passed || '',
      failed: x.failed || '',
      passRate: x.pass_rate || '',
      reportUrl: ''
    }))
    currentPage.value = 1
  } catch (_) {}
}

const deleteHistoryReport = async (item) => {
  try {
    const res = await apiFetch(`${apiBase.value}/api/reports/history/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_name: item.reportName })
    })
    if (!res.ok) throw new Error('delete failed')
    history.value = history.value.filter(x => x !== item)
    if (currentPage.value > Math.max(1, Math.ceil(history.value.length / pageSize))) currentPage.value = Math.max(1, Math.ceil(history.value.length / pageSize))
    toastType.value = 'success'
    toastMsg.value = '删除成功'
    toastShow.value = true
  } catch (_) {
    toastType.value = 'error'
    toastMsg.value = '删除失败'
    toastShow.value = true
  }
}

onMounted(() => {
  loadFiles()
  loadHistory()
})
</script>

<template>
  <Toast v-model:show="toastShow" :message="toastMsg" :type="toastType" />
  <div class="exec-page">
    <div class="exec-header">执行测试</div>
    <section class="card">
      <div class="card-title">执行配置</div>
      <div class="card-body">
        <div class="form-item">
          <label class="label">测试用例文件</label>
          <select class="select" v-model="selectedFile">
            <option value="">选择文件</option>
            <option v-for="f in files" :key="f" :value="f">{{ f }}</option>
          </select>
        </div>
        <div class="form-item">
          <label class="label">环境</label>
          <select class="select" v-model="env">
            <option value="test">test</option>
            <option value="dev">dev</option>
            <option value="prod">prod</option>
          </select>
        </div>
        <div class="form-item">
          <label class="label">base_url（来自配置管理）</label>
          <input class="input" :value="baseUrl" disabled />
          <div class="tips">用于拼接完整接口：base_url + 请求URL</div>
        </div>
        <div>
          <button class="btn primary" @click="startRun">开始执行</button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-title">执行状态</div>
      <div class="card-body">
        <TaskCard
          v-if="taskId"
          title="执行任务"
          :status="taskStatus || (running ? 'running' : (success ? 'done' : ''))"
          :progress="taskProgress"
          :subtitle="selectedFile ? `用例文件：${selectedFile}` : ''"
        >
          <div v-if="taskError" style="color:#ef4444">{{ taskError }}</div>
          <div v-else-if="taskStatus === 'running' || running">执行中：{{ taskProgress }}%</div>
          <div v-else-if="taskStatus === 'done' || success">执行完成</div>
        </TaskCard>
        <div v-else-if="running" class="status info">执行中... 请稍候</div>
        <div v-else-if="success" class="status ok">执行成功！测试执行完成！</div>
      </div>
    </section>

    <section class="card">
      <div class="card-title">历史执行记录</div>
      <div class="card-body">
        <div class="history-toolbar">
          <button class="btn danger" @click="clearHistory">清空记录（测试报告会一起清空）</button>
        </div>
        <div class="table-container">
          <table class="history-table">
            <thead>
              <tr>
                <th>执行时间</th>
                <th>测试文件</th>
                <th>报告名称</th>
                <th>用例数量</th>
                <th>通过数</th>
                <th>失败数</th>
                <th>通过率</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in pagedHistory" :key="item.executedAt + item.reportName">
                <td>{{ item.executedAt }}</td>
                <td>{{ item.fileName }}</td>
                <td>{{ item.reportName }}</td>
                <td>{{ item.total }}</td>
                <td>{{ item.passed }}</td>
                <td>{{ item.failed }}</td>
                <td>{{ item.passRate }}</td>
                <td class="operation">
                  <IconButton :src="checkIcon" title="查看报告" :size="18" :button-size="36" @click="viewReport(item)" />
                  <IconButton :src="deleteIcon" title="删除" :size="18" :button-size="36" @click="deleteHistoryReport(item)" />
                </td>
              </tr>
              <tr v-if="!history.length">
                <td colspan="8" class="empty">暂无历史记录</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination v-model="currentPage" :total="totalItems" :page-size="pageSize" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.exec-page {
  width: 100%;
  height: 100%;
  padding: 16px;
  background: linear-gradient(180deg, #f5f8ff 0%, #f7fbff 100%);
  box-sizing: border-box;
}
.exec-header {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
}
.card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
  overflow: hidden;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
}
.card-body {
  padding: 16px;
}
.card, .card-title, .card-body, .form-item, .tips, .status, .exec-header {
  text-align: left;
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
.select, .input {
  width: 280px;
  height: 40px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
}
.tips {
  color: #999;
  font-size: 12px;
  margin-top: 6px;
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
.btn.danger {
  color: #fff;
  background: linear-gradient(90deg, #e04646 0%, #ff5a5a 100%);
  border-color: #e04646;
}
.status {
  padding: 14px 16px;
  border-radius: 8px;
}
.status.info {
  background: #e8f1ff;
  color: #1e50c8;
}
.status.ok {
  background: #e8fff3;
  color: #2DB36A;
}
.history-toolbar {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 12px;
}
.table-container {
  width: 100%;
  overflow-x: auto;
}
.history-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}
.history-table thead th {
  text-align: left;
  padding: 12px 16px;
  font-weight: 600;
  color: #555;
  font-size: 13px;
  border-bottom: 1px solid #f0f0f0;
}
.history-table tbody td {
  padding: 12px 16px;
  color: #333;
  font-size: 13px;
  border-bottom: 1px solid #f5f5f5;
}
.history-table tbody tr:last-child td {
  border-bottom: none;
}
.operation {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
}
.empty {
  text-align: center;
  color: #999;
  padding: 20px 0;
}
</style>
