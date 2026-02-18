<script setup>
import { ref } from 'vue'

// 1. 引入路由钩子
import { useRouter } from 'vue-router'
// 2. 获取路由实例
const router = useRouter()

// 响应式变量：绑定输入框与密码可见性
const username = ref('')
const password = ref('')
const isPwdVisible = ref(false) // 初始隐藏密码

// 登录按钮点击逻辑（后续可替换为接口请求）
// const handleLogin = () => {
//   alert(`用户名：${username.value}\n密码: ${password.value}`)
//   //alert(`用户名或密码错误!`)
// }

const handleLogin = async () => {
  const base = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000'
  try {
    const res = await fetch(`${base}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value })
    })
    if (!res.ok) {
      const text = await res.text()
      alert(text || '登录失败')
      return
    }
    const data = await res.json()
    if (data && data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('username', username.value)
      router.push('/main')
    } else {
      alert('登录响应异常')
    }
  } catch (e) {
    alert('无法连接服务器')
  }
}

</script>

<template>
  <link rel="stylesheet" href="https://cdn.bootcdn.net/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
  <!-- 页面容器：居中布局 -->
  <div class="login-page">
    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- 标题 -->
      <h1 class="login-title">智能接口测试平台</h1>

      <!-- 用户名输入项 -->
      <div class="form-item">
        <label class="form-label">用户名</label>
        <input
          type="text"
          v-model="username"
          class="form-input"
          placeholder="请输入用户名"
        />
      </div>

      <!-- 密码输入项（带眼睛切换） -->
      <div class="form-item">
        <label class="form-label">密码</label>
        <div class="pwd-input-wrapper">
          <!-- 密码框：根据isPwdVisible切换type -->
          <input
            :type="isPwdVisible ? 'text' : 'password'"
            v-model="password"
            class="form-input pwd-input"
            placeholder="请输入密码"
          />
          <!-- 眼睛图标：点击切换密码可见性 -->
          <span
            class="pwd-eye"
            @click="isPwdVisible = !isPwdVisible"
            :title="isPwdVisible ? '隐藏密码' : '显示密码'"
          >
          <i :class="isPwdVisible ? 'icon-eye-open' : 'icon-eye-close'"></i>
          </span>
        </div>
      </div>

      <!-- 登录按钮 -->
      <button class="login-btn" @click="handleLogin">登录</button>

      <!-- 底部链接：忘记密码/注册 -->
      <!-- <div class="link-group">
        <a href="#" class="login-link">忘记密码</a>
        <a href="#" class="login-link">注册新账号</a>
      </div> -->
      
    </div>
  </div>
</template>

<style scoped>

/* 页面背景样式 - 全屏修改 */
.login-page {
  background-color: #f5f7fa;
  /* 核心：固定定位 + 四边为0，占满整个屏幕 */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* 保留居中布局 */
  display: flex;
  justify-content: center;
  align-items: center;
  /* 内边距，防止卡片贴边（小屏幕适配） */
  padding: 20px;
}

/* 登录卡片样式（还原截图的白色卡片+阴影） */
.login-card {
  width: 100%;
  max-width: 450px;
  background: #fff;
  padding: 30px 25px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

/* 标题样式（匹配截图的蓝色+居中） */
.login-title {
  text-align: center;
  font-size: 24px;
  color: #1e50c8;
  margin-bottom: 30px;
  font-weight: 600;
}

/* 先补充表单项容器样式（关键：统一控制内部元素居左） */
.form-item {
  margin-bottom: 20px;
  text-align: left; /* 容器内所有元素整体居左对齐 */
}

.form-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  text-align: left; /* 标签文字显式居左（避免父级样式干扰） */
}
.form-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  box-sizing: border-box;
  transition: border-color 0.2s;
  text-align: left; /* 输入框内文字居左（默认左对齐，显式声明更稳妥） */
}
/* 输入框聚焦时的蓝色边框（还原截图） */
.form-input:focus {
  outline: none;
  border-color: #1e50c8;
}

/* 密码输入框容器（用于眼睛图标的绝对定位） */
.pwd-input-wrapper {
  position: relative;
}
.pwd-input {
  padding-right: 40px; /* 给眼睛图标留空间 */
}
/* 眼睛图标样式 */
.pwd-eye {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: #999;
  cursor: pointer;
  user-select: none;
}
.pwd-eye:hover {
  color: #1e50c8;
}

/**闭眼*/
.icon-eye-open:before {
    content: '';
    display: inline-block;
    width: 18px;
    height: 18px;
    background: url("src/assets/icon-eye-open.png") no-repeat center;
    background-size: cover;
    vertical-align: middle;
    cursor: pointer;
}

/**睁眼*/
.icon-eye-close:before {
    content: '';
    display: inline-block;
    width: 18px;
    height: 18px;
    background: url("src/assets/icon-eye-close.png") no-repeat center;
    background-size: cover;
    vertical-align: middle;
    cursor: pointer;
}

/* 登录按钮样式（还原截图的蓝色渐变） */
.login-btn {
  width: 100%;
  height: 44px;
  background: linear-gradient(90deg, #1e50c8 0%, #3a78f4 100%);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}
.login-btn:hover {
  opacity: 0.9;
}

/* 底部链接样式（居左/居右） */
.link-group {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}
.login-link {
  font-size: 14px;
  color: #1e50c8;
  text-decoration: underline;
  cursor: pointer;
}
.login-link:hover {
  color: #3a78f4;
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
