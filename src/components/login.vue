<script setup>
import { ref } from 'vue'

import { useRouter } from 'vue-router'
import Toast from './ui/Toast.vue'
import { apiFetch, setAccessToken, setRefreshToken } from '../utils/api'

const router = useRouter()

const username = ref('')
const password = ref('')
const loginErrors = ref({ username: '', password: '' })
const toastShow = ref(false)
const toastMsg = ref('')
const toastType = ref('success')

const showToast = (msg, type = 'info') => {
  toastMsg.value = msg || ''
  toastType.value = type
  toastShow.value = true
}

const regUsername = ref('')
const regPassword = ref('')
const regPassword2 = ref('')
const regErrors = ref({ username: '', password: '', password2: '' })

const base = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000'
const activeCard = ref('login')

// 登录/注册切换按钮点击时，统一清空两侧表单的残留错误提示
const resetErrorBag = (bagRef) => {
  const bag = bagRef.value || {}
  const next = {}
  for (const key of Object.keys(bag)) next[key] = ''
  bagRef.value = next
}

const switchAuthCard = (card) => {
  resetErrorBag(loginErrors)
  resetErrorBag(regErrors)
  activeCard.value = card
}

const handleLogin = async () => {
  loginErrors.value = { username: '', password: '' }
  if (!username.value.trim()) loginErrors.value.username = '用户名必填'
  if (!password.value) loginErrors.value.password = '访问密码必填'
  if (loginErrors.value.username || loginErrors.value.password) return

  try {
    const res = await apiFetch(`${base}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value }),
      skipAuth: true
    })
    if (!res.ok) {
      if (res.status === 401) {
        showToast('用户名或密码错误!', 'error')
        return
      }
      const text = await res.text()
      showToast(text || '登录失败', 'error')
      return
    }
    const data = await res.json()
    if (data && data.token) {
      setAccessToken(data.token)
      setRefreshToken(data.refresh_token || '')
      localStorage.setItem('username', username.value)
      showToast('登录成功', 'success')
      setTimeout(() => router.push('/main'), 2500)
    } else {
      showToast('登录响应异常', 'error')
    }
  } catch (e) {
    showToast('无法连接服务器', 'error')
  }
}

const handleRegister = async () => {
  regErrors.value = { username: '', password: '', password2: '' }
  const u = regUsername.value.trim()
  const p1 = regPassword.value
  const p2 = regPassword2.value

  if (!u) regErrors.value.username = '用户名必填'
  if (!p1) regErrors.value.password = '访问密码必填'
  if (!p2) regErrors.value.password2 = '请再次输入密码'
  if (regErrors.value.username || regErrors.value.password || regErrors.value.password2) return

  const unOk = /^[A-Za-z0-9_]+$/.test(u)
  if (!unOk) {
    regErrors.value.username = '用户名仅支持英文、数字、下划线'
    return
  }
  const pwOk = /^[A-Za-z0-9_]+$/.test(p1) && p1.length >= 6
  if (!pwOk) {
    regErrors.value.password = '密码需≥6位，且仅支持英文、数字、下划线'
    return
  }

  if (p1 !== p2) {
    regErrors.value.password2 = '两次输入的密码不一致'
    return
  }

  try {
    const res = await apiFetch(`${base}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p1 }),
      skipAuth: true
    })

    if (!res.ok) {
      if (res.status === 409) {
        showToast('用户名已存在!', 'error')
        return
      }
      const text = (await res.text()) || ''
      const t = text.toLowerCase()
      if (t.includes('missing params')) {
        showToast('请输入完整信息!', 'error')
        return
      }
      if (t.includes('username already exists')) {
        showToast('用户名已存在!', 'error')
        return
      }
      showToast('注册失败', 'error')
      return
    }

    showToast('注册成功，请登录', 'success')
    username.value = u
    password.value = ''
    regUsername.value = ''
    regPassword.value = ''
    regPassword2.value = ''
    activeCard.value = 'login'
  } catch (e) {
    showToast('无法连接服务器', 'error')
  }
}
</script>

<template>
  <div class="auth-page">
    <Toast v-model:show="toastShow" :message="toastMsg" :type="toastType" />
    <div class="auth-layout" :data-active="activeCard">
      <div class="auth-card login-card">
        <div class="card-header">
          <h1 class="card-title">欢迎登录</h1>
          <div class="card-subtitle">接口自动化测试平台</div>
        </div>

        <el-form label-position="top" class="auth-form" @submit.prevent>
          <el-form-item label="用户名" :error="loginErrors.username">
            <el-input v-model="username" placeholder="请输入用户名" clearable @input="loginErrors.username = ''" />
          </el-form-item>

          <el-form-item label="密码" :error="loginErrors.password">
            <el-input
              v-model="password"
              type="password"
              show-password
              placeholder="请输入密码"
              @input="loginErrors.password = ''"
            />
          </el-form-item>

          <el-button type="primary" class="primary-btn" @click="handleLogin">登录</el-button>
        </el-form>

        <div class="hint-row">
          <span class="hint-text"></span>
          <!-- 测试账号：6 / 6 可直通 -->
        </div>

        <div class="switch-row">
          <span class="switch-text">还没有账号？</span>
          <button type="button" class="switch-action" @click="switchAuthCard('register')">立即注册</button>
        </div>
      </div>

      <div class="auth-card register-card">
        <div class="card-header">
          <h1 class="card-title">创建账号</h1>
          <div class="card-subtitle">首次使用请先注册</div>
        </div>

        <el-form label-position="top" class="auth-form" @submit.prevent>
          <el-form-item label="用户名" :error="regErrors.username">
            <el-input v-model="regUsername" placeholder="请输入用户名" clearable @input="regErrors.username = ''" />
          </el-form-item>

          <el-form-item label="密码" :error="regErrors.password">
            <el-input
              v-model="regPassword"
              type="password"
              show-password
              placeholder="请输入密码"
              @input="regErrors.password = ''"
            />
          </el-form-item>

          <el-form-item label="确认密码" :error="regErrors.password2">
            <el-input
              v-model="regPassword2"
              type="password"
              show-password
              placeholder="请再次输入密码"
              @input="regErrors.password2 = ''"
            />
          </el-form-item>

          <el-button type="primary" class="secondary-btn" @click="handleRegister">注册</el-button>
        </el-form>

        <div class="switch-row">
          <span class="switch-text">已有账号？</span>
          <button type="button" class="switch-action" @click="switchAuthCard('login')">立即登录</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  background: radial-gradient(1100px 650px at 20% 20%, rgba(124, 58, 237, 0.35), rgba(245, 247, 250, 0) 60%),
    radial-gradient(900px 500px at 80% 30%, rgba(59, 130, 246, 0.22), rgba(245, 247, 250, 0) 55%),
    #f5f7fa;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
}

.auth-layout {
  width: 100%;
  max-width: 520px;
  display: grid;
  grid-template-columns: 1fr;
  position: relative;
}

.auth-card {
  grid-area: 1 / 1;
  background: #fff;
  padding: 28px 24px;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  border: 1px solid rgba(15, 23, 42, 0.06);
  backdrop-filter: blur(6px);
  transition: transform 240ms ease, opacity 240ms ease, box-shadow 240ms ease;
  will-change: transform;
}

.auth-layout[data-active="login"] .login-card {
  z-index: 2;
  transform: translate(0, 0);
  opacity: 1;
  pointer-events: auto;
}
.auth-layout[data-active="login"] .register-card {
  z-index: 1;
  transform: translate(18px, 18px);
  opacity: 0.92;
  pointer-events: none;
}
.auth-layout[data-active="register"] .register-card {
  z-index: 2;
  transform: translate(0, 0);
  opacity: 1;
  pointer-events: auto;
}
.auth-layout[data-active="register"] .login-card {
  z-index: 1;
  transform: translate(18px, 18px);
  opacity: 0.92;
  pointer-events: none;
}

.card-header {
  margin-bottom: 18px;
}

.card-title {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
  font-weight: 700;
  color: #0f172a;
}

.card-subtitle {
  margin-top: 6px;
  font-size: 14px;
  color: rgba(15, 23, 42, 0.65);
}

.form-item {
  margin-bottom: 20px;
  text-align: left;
}

.form-label {
  display: block;
  font-size: 14px;
  color: rgba(15, 23, 42, 0.75);
  margin-bottom: 8px;
  text-align: left;
}
.form-input {
  width: 100%;
  height: 42px;
  padding: 0 14px;
  border: 1px solid rgba(15, 23, 42, 0.14);
  border-radius: 10px;
  font-size: 14px;
  color: #333;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  text-align: left;
  background: rgba(255, 255, 255, 0.92);
}
.form-input:focus {
  outline: none;
  border-color: rgba(30, 80, 200, 0.6);
  box-shadow: 0 0 0 4px rgba(30, 80, 200, 0.12);
}
.form-input.is-error {
  border-color: #ff4d4f;
  background: #fff1f0;
  box-shadow: none;
}
.form-input.is-error:focus {
  border-color: #ff4d4f;
  box-shadow: 0 0 0 4px rgba(255, 77, 79, 0.12);
}
.field-error {
  margin-top: 6px;
  font-size: 12px;
  color: #ff4d4f;
}

 :deep(.el-form-item__label) {
  font-size: 14px;
  color: rgba(15, 23, 42, 0.75);
 }
 :deep(.el-input__wrapper) {
  border-radius: 10px;
 }

.primary-btn,
.secondary-btn {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.primary-btn {
  --el-button-bg-color: #1e50c8;
  --el-button-border-color: #1e50c8;
  --el-button-hover-bg-color: #3a78f4;
  --el-button-hover-border-color: #3a78f4;
  --el-button-active-bg-color: #1e50c8;
  --el-button-active-border-color: #1e50c8;
}
.secondary-btn {
  --el-button-bg-color: #7c3aed;
  --el-button-border-color: #7c3aed;
  --el-button-hover-bg-color: #a855f7;
  --el-button-hover-border-color: #a855f7;
  --el-button-active-bg-color: #7c3aed;
  --el-button-active-border-color: #7c3aed;
}
.primary-btn:hover,
.secondary-btn:hover {
  opacity: 0.9;
}
.primary-btn:focus,
.secondary-btn:focus {
  outline: none;
}
.primary-btn:focus-visible,
.secondary-btn:focus-visible {
  outline: none;
  box-shadow: none;
}

.hint-row {
  margin-top: 12px;
}
.hint-text {
  font-size: 12px;
  color: rgba(15, 23, 42, 0.55);
}

.switch-row {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.switch-text {
  font-size: 14px;
  color: rgba(15, 23, 42, 0.65);
}
.switch-action {
  border: 0;
  background: transparent;
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: background-color 160ms ease, color 160ms ease, transform 160ms ease;
}
.login-card .switch-action {
  color: #7c3aed;
}
.register-card .switch-action {
  color: #1e50c8;
}
.switch-action:hover {
  transform: translateY(-1px);
}
.login-card .switch-action:hover {
  background: rgba(124, 58, 237, 0.12);
  color: #6d28d9;
}
.register-card .switch-action:hover {
  background: rgba(30, 80, 200, 0.12);
  color: #1d4ed8;
}
.switch-action:focus {
  outline: none;
}
.switch-action:focus-visible {
  outline: none;
  box-shadow: none;
}
</style>

<!-- 

<script setup>
import { ref } from 'vue'

defineProps({
  msg: String,
})

const count = ref(0)
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Learn more about IDE Support for Vue in the
    <a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
      >Vue Docs Scaling up Guide</a
    >.
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style> -->
