<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const apiBase = computed(() => import.meta.env.VITE_API_BASE || localStorage.getItem('apiBase') || 'http://127.0.0.1:5000')
const toAbsUrl = (base, rel) => {
  const p = String(rel || '').replace(/^\\+|^\/+/, '').replace(/\\/g, '/')
  return `${String(base).replace(/\/$/, '')}/${p}`
}

const files = ref([])
const selectedFile = ref(files.value[0] || '')
const env = ref('test')
const concurrency = ref(1)
const running = ref(false)
const success = ref(false)
const history = ref([
  {
    executedAt: '2026-02-19 20:36:07',
    fileName: 'news-csv.csv',
    reportName: 'test_report_20260219_203608.html',
    total: 2,
    passed: 2,
    failed: 0,
    passRate: '100.00%',
    reportUrl: '/reports/test_report_20260219_203608.html'
  }
])
const router = useRouter()

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
  running.value = true
  success.value = false
  try {
    const body = {
      file_path: selectedFile.value,
      env: env.value,
      concurrency: Number(concurrency.value) || 1
    }
    const res = await fetch(`${apiBase.value}/api/execute/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error('执行失败')
    const data = await res.json()
    const now = new Date()
    history.value.unshift({
      executedAt: formatTime(now),
      fileName: baseName(selectedFile.value),
      reportName: data.report_name,
      total: data.total,
      passed: data.passed,
      failed: data.failed,
      passRate: data.pass_rate,
      reportUrl: data.report_url
    })
    success.value = true
  } catch (e) {
    success.value = false
  } finally {
    running.value = false
  }
}

const clearHistory = () => {
  history.value = []
}
const viewReport = (item) => {
  router.push({ path: '/main/report', query: { name: item.reportName } })
}

const loadFiles = async () => {
  try {
    const res = await fetch(`${apiBase.value}/api/cases/files`)
    if (!res.ok) return
    const data = await res.json()
    const arr = Array.isArray(data.files) ? data.files : []
    files.value = arr.map(x => x.file_path || '').filter(Boolean)
    selectedFile.value = files.value[0] || ''
  } catch (_) {}
}
loadFiles()
</script>

<template>
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
          <label class="label">并发数</label>
          <input class="input" type="number" min="1" v-model="concurrency" />
          <div class="tips">设置测试执行的并发数，根据系统性能调整</div>
        </div>
        <div>
          <button class="btn primary" @click="startRun">开始执行</button>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="card-title">执行状态</div>
      <div class="card-body">
        <div v-if="running" class="status info">执行中... 请稍候</div>
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
              <tr v-for="item in history" :key="item.executedAt + item.reportName">
                <td>{{ item.executedAt }}</td>
                <td>{{ item.fileName }}</td>
                <td>{{ item.reportName }}</td>
                <td>{{ item.total }}</td>
                <td>{{ item.passed }}</td>
                <td>{{ item.failed }}</td>
                <td>{{ item.passRate }}</td>
                <td class="operation">
                  <button class="btn primary" @click="viewReport(item)">查看报告</button>
                </td>
              </tr>
              <tr v-if="!history.length">
                <td colspan="8" class="empty">暂无历史记录</td>
              </tr>
            </tbody>
          </table>
        </div>
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
  border-bottom: 1px solid #f0f0f0;
}
.history-table tbody td {
  padding: 12px 16px;
  color: #333;
  border-bottom: 1px solid #f5f5f5;
}
.history-table tbody tr:last-child td {
  border-bottom: none;
}
.operation {
  text-align: right;
}
.empty {
  text-align: center;
  color: #999;
  padding: 20px 0;
}
</style>
