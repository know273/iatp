<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Toast from './ui/Toast.vue'
import Pagination from './ui/Pagination.vue'
import { View, Delete } from '@element-plus/icons-vue'
import { apiFetch } from '../utils/api'
import { setHtmlReportCount } from '../stores/systemStats'

const route = useRoute()
const apiBase = computed(() => import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000')
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
  const token = localStorage.getItem('token') || ''
  const refreshToken = localStorage.getItem('refresh_token') || ''
  if ((!token || token.split('.').length !== 3) && (!refreshToken || refreshToken.split('.').length !== 3)) {
    toastType.value = 'error'
    toastMsg.value = '请先登录'
    toastShow.value = true
    return
  }
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
  try {
    const res = await apiFetch(`${apiBase.value}/api/reports/report/signed-url?report_name=${encodeURIComponent(item.reportName)}`)
    if (!res.ok) throw new Error(await res.text())
    const data = await res.json()
    if (!data || !data.url) throw new Error('missing url')
    window.open(toAbsUrl(apiBase.value, data.url), '_blank')
  } catch (_) {
    toastType.value = 'error'
    toastMsg.value = '打开失败'
    toastShow.value = true
  }
}

const loadReports = async () => {
  try {
    const res = await apiFetch(`${apiBase.value}/api/reports/report/files`)
    if (!res.ok) return
    const data = await res.json()
    const arr = Array.isArray(data.reports) ? data.reports : []
    reports.value = arr.map(x => ({
      reportName: x.report_name,
      size: x.size,
      createdAt: x.createdAt
    }))
    setHtmlReportCount(reports.value.length)
    currentPage.value = 1
  } catch (_) {}
}
onMounted(loadReports)

const removeReport = async (idx) => {
  const item = pagedReports.value[idx]
  if (!item) return
  try {
    const res = await apiFetch(`${apiBase.value}/api/reports/report/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report_name: item.reportName })
    })
    if (!res.ok) throw new Error('delete failed')
    const realIndex = reports.value.findIndex(x => x.reportName === item.reportName)
    if (realIndex >= 0) reports.value.splice(realIndex, 1)
    setHtmlReportCount(reports.value.length)
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
    <el-card class="card" shadow="never">
      <template #header>
        <div class="card-title">报告列表</div>
      </template>
      <div class="card-body">
        <el-table :data="pagedReports" style="width: 100%">
          <el-table-column prop="reportName" label="报告名称" min-width="320" show-overflow-tooltip />
          <el-table-column prop="size" label="大小" width="110" />
          <el-table-column prop="createdAt" label="生成时间" width="180" />
          <el-table-column label="操作" width="180">
            <template #default="{ row, $index }">
              <div class="operation">
                <el-button circle :icon="View" @click="openReport(row)" />
                <el-button circle type="danger" :icon="Delete" @click="removeReport($index)" />
              </div>
            </template>
          </el-table-column>
          <template #empty>
            <div class="empty">暂无报告</div>
          </template>
        </el-table>
        <Pagination v-model="currentPage" :total="totalItems" :page-size="pageSize" />
      </div>
    </el-card>
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
  padding: 0;
  color: #2DB36A;
  text-align: left;
}
.card-body {
  padding: 0;
}
.card :deep(.el-card__header) {
  padding: 6px 8px;
}
.card :deep(.el-card__body) {
  padding: 6px 8px;
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
