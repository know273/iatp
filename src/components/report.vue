<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Toast from './ui/Toast.vue'
import Pagination from './ui/Pagination.vue'
import IconButton from './ui/IconButton.vue'
import checkIcon from '../assets/check.svg'
import deleteIcon from '../assets/delete.svg'
import downloadIcon from '../assets/download.svg'

const route = useRoute()
const apiBase = computed(() => import.meta.env.VITE_API_BASE || localStorage.getItem('apiBase') || 'http://127.0.0.1:5000')
const toAbsUrl = (base, rel) => {
  const p = String(rel || '').replace(/^\\+|^\/+/, '').replace(/\\/g, '/')
  return String(base).replace(/\/$/, '') + '/' + p
}
const reports = ref([])
const currentPage = ref(1)
const pageSize = 10
const totalItems = computed(() => reports.value.length)
const pagedReports = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return reports.value.slice(start, start + pageSize)
})
const toastShow = ref(false)
const toastMsg = ref('')
const toastType = ref('success')

const ensureQueryReport = () => {
  const name = route.query?.name
  if (!name) return
  const exists = reports.value.some(r => r.reportName === name)
  if (!exists) {
    reports.value.unshift({
      reportName: String(name),
      size: '未知',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    })
  }
}
ensureQueryReport()

const openReport = async (item) => {
  try {
    const token = localStorage.getItem('token') || ''
    const headers = token && token.split('.').length === 3 ? { Authorization: `Bearer ${token}` } : {}
    const res = await fetch(`${apiBase.value}/api/reports/report/exists?report_name=${encodeURIComponent(item.reportName)}`, { headers })
    const data = await res.json()
    if (!data.exists) {
      toastType.value = 'error'
      toastMsg.value = '已删除'
      toastShow.value = true
      return
    }
  } catch (_) {
  }
  const token = localStorage.getItem('token') || ''
  if (!token || token.split('.').length !== 3) {
    toastType.value = 'error'
    toastMsg.value = '请先登录'
    toastShow.value = true
    return
  }
  const url = toAbsUrl(apiBase.value, `/api/reports/report/view?report_name=${encodeURIComponent(item.reportName)}&token=${encodeURIComponent(token)}`)
  window.open(url, '_blank')
}

const downloadCSV = (item) => {
  const headers = ['报告名称', '大小', '生成时间']
  const row = [item.reportName, item.size, item.createdAt]
  const csv = `${headers.join(',')}\n${row.join(',')}\n`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${item.reportName.replace(/\.html$/,'')}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

const loadReports = async () => {
  try {
    const token = localStorage.getItem('token') || ''
    const headers = token && token.split('.').length === 3 ? { Authorization: `Bearer ${token}` } : {}
    const res = await fetch(`${apiBase.value}/api/reports/report/files`, { headers })
    if (!res.ok) return
    const data = await res.json()
    const arr = Array.isArray(data.reports) ? data.reports : []
    reports.value = arr.map(x => ({
      reportName: x.report_name,
      size: x.size,
      createdAt: x.createdAt
    }))
    currentPage.value = 1
  } catch (_) {}
}
onMounted(loadReports)

const removeReport = async (idx) => {
  const item = pagedReports.value[idx]
  if (!item) return
  try {
    const token = localStorage.getItem('token') || ''
    const auth = token && token.split('.').length === 3 ? { Authorization: `Bearer ${token}` } : {}
    const res = await fetch(`${apiBase.value}/api/reports/report/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify({ report_name: item.reportName })
    })
    if (!res.ok) throw new Error('delete failed')
    const realIndex = reports.value.findIndex(x => x.reportName === item.reportName)
    if (realIndex >= 0) reports.value.splice(realIndex, 1)
    if (currentPage.value > Math.max(1, Math.ceil(reports.value.length / pageSize))) currentPage.value = Math.max(1, Math.ceil(reports.value.length / pageSize))
    toastType.value = 'success'
    toastMsg.value = '删除成功'
    toastShow.value = true
  } catch (_) {
    toastType.value = 'error'
    toastMsg.value = '删除失败'
    toastShow.value = true
  }
}
</script>

<template>
  <div class="page-full">
    <Toast v-model:show="toastShow" :message="toastMsg" :type="toastType" />
    <div class="page-full-title">测试报告</div>
    <div class="page-subtitle">查看和管理测试报告</div>
    <section class="card">
      <div class="card-title">报告列表</div>
      <div class="card-body">
        <div class="table-container">
          <table class="report-table">
            <thead>
              <tr>
                <th>报告名称</th>
                <th>大小</th>
                <th>生成时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in pagedReports" :key="item.reportName">
                <td>{{ item.reportName }}</td>
                <td>{{ item.size }}</td>
                <td>{{ item.createdAt }}</td>
                <td class="operation">
                  <IconButton :src="checkIcon" title="查看" :size="16" :button-size="32" @click="openReport(item)" />
                  <IconButton :src="downloadIcon" title="下载csv" :size="16" :button-size="32" @click="downloadCSV(item)" />
                  <IconButton :src="deleteIcon" title="删除" :size="16" :button-size="32" @click="removeReport(idx)" />
                </td>
              </tr>
              <tr v-if="!reports.length">
                <td colspan="4" class="empty">暂无报告</td>
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
.page-full {
  width: 100%;
  min-height: 100%;
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
  text-align: left;
}
.page-subtitle {
  font-size: 14px;
  color: #777;
  padding: 12px 16px;
  text-align: left;
}
.page-full-body {
  flex: 1;
  padding: 16px;
  color: #333;
}
.card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
  margin: 0 16px 16px 16px;
  overflow: hidden;
}
.card-title {
  font-size: 16px;
  font-weight: 600;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f0f0;
  text-align: left;
}
.card-body {
  padding: 16px;
}
.table-container {
  width: 100%;
  overflow-x: auto;
}
.report-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}
.report-table thead th {
  text-align: left;
  padding: 12px 16px;
  font-weight: 600;
  color: #555;
  border-bottom: 1px solid #f0f0f0;
}
.report-table tbody td {
  padding: 12px 16px;
  color: #333;
  border-bottom: 1px solid #f5f5f5;
}
.report-table tbody tr:last-child td {
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
