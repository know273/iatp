<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const apiBase = computed(() => import.meta.env.VITE_API_BASE || localStorage.getItem('apiBase') || 'http://127.0.0.1:5000')
const toAbsUrl = (base, rel) => {
  const p = String(rel || '').replace(/^\\+|^\/+/, '').replace(/\\/g, '/')
  return String(base).replace(/\/$/, '') + '/' + p
}
const reports = ref([])

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

const openReport = (item) => {
  const url = toAbsUrl(apiBase.value, `/reports/${item.reportName}`)
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

const downloadJSON = (item) => {
  const data = {
    reportName: item.reportName,
    size: item.size,
    createdAt: item.createdAt
  }
  // 已在外层声明 blob，此处无需重复声明

const loadReports = async () => {
  try {
    const res = await fetch(`${apiBase.value}/api/reports/files`)
    if (!res.ok) return
    const data = await res.json()
    const arr = Array.isArray(data.reports) ? data.reports : []
    reports.value = arr.map(x => ({
      reportName: x.report_name,
      size: x.size,
      createdAt: x.createdAt
    }))
  } catch (_) {}
}
onMounted(loadReports)
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${item.reportName.replace(/\.html$/,'')}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

const removeReport = (idx) => {
  reports.value.splice(idx, 1)
}
</script>

<template>
  <div class="page-full">
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
              <tr v-for="(item, idx) in reports" :key="item.reportName">
                <td>{{ item.reportName }}</td>
                <td>{{ item.size }}</td>
                <td>{{ item.createdAt }}</td>
                <td class="operation">
                  <button class="btn primary" @click="openReport(item)">查看</button>
                  <button class="btn success" @click="downloadCSV(item)">下载CSV</button>
                  <button class="btn info" @click="downloadJSON(item)">下载JSON</button>
                  <button class="btn danger" @click="removeReport(idx)">删除</button>
                </td>
              </tr>
              <tr v-if="!reports.length">
                <td colspan="4" class="empty">暂无报告</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
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
  text-align: right;
}
.empty {
  text-align: center;
  color: #999;
  padding: 20px 0;
}
.btn {
  height: 32px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #f9f9f9;
  cursor: pointer;
  font-size: 14px;
  margin-left: 8px;
}
.btn.primary {
  color: #fff;
  background: linear-gradient(90deg, #1e50c8 0%, #3a78f4 100%);
  border-color: #1e50c8;
}
.btn.success {
  color: #fff;
  background: linear-gradient(90deg, #2db36a 0%, #3fd184 100%);
  border-color: #2db36a;
}
.btn.info {
  color: #fff;
  background: linear-gradient(90deg, #10a4d3 0%, #18b6eb 100%);
  border-color: #10a4d3;
}
.btn.danger {
  color: #fff;
  background: linear-gradient(90deg, #e04646 0%, #ff5a5a 100%);
  border-color: #e04646;
}
</style>
