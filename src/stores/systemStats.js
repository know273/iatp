import { ref } from 'vue'
import { apiFetch } from '../utils/api'

export const csvCount = ref(0)
export const htmlReportCount = ref(0)

export const setCsvCount = (n) => {
  csvCount.value = Math.max(0, Number(n) || 0)
}

export const setHtmlReportCount = (n) => {
  htmlReportCount.value = Math.max(0, Number(n) || 0)
}

export const refreshStats = async (apiBase) => {
  const base = String(apiBase || '').replace(/\/$/, '')
  try {
    const res = await apiFetch(`${base}/api/cases/files`)
    if (res.ok) {
      const data = await res.json()
      const arr = Array.isArray(data.files) ? data.files : []
      const cnt = arr.filter((x) => String(x && x.file_name ? x.file_name : '').toLowerCase().endsWith('.csv')).length
      setCsvCount(cnt)
    }
  } catch (_) {}

  try {
    const res = await apiFetch(`${base}/api/reports/report/files`)
    if (res.ok) {
      const data = await res.json()
      const arr = Array.isArray(data.reports) ? data.reports : []
      setHtmlReportCount(arr.length)
    }
  } catch (_) {}
}

