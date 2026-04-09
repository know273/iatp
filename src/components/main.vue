<!-- App.vue -->
<template>
  <div class="app-container">
    <Toast v-model:show="toastShow" :message="toastMsg" :type="toastType" />
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-title">接口自动化测试平台 V1.0.0</div>
      <div class="header-user">
        <span>{{ currentUser }}</span>
        <button class="logout-btn" @click="handleLogout">退出</button>
      </div>
    </header>
    <div class="main-layout">
      <!-- 左侧侧边栏 -->
      <aside class="sidebar">
        <div class="sidebar-menu">
          <div class="menu-title">功能菜单</div>
          <div
            v-for="item in menuItems"
            :key="item.path"
            :class="['menu-item', { active: activeMenu === item.path }]"
            @click="(activeMenu = item.path, router.push(item.path))"
          >
            <img v-if="item.icon" class="menu-icon" :src="item.icon" alt="" />
            {{ item.name }}
          </div>
        </div>
      </aside>
      <!-- 右侧主内容区 -->
      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Toast from './ui/Toast.vue'
import { clearAuth } from '../utils/api'
import iconHome from '../assets/home.svg'
import iconConfig from '../assets/config.svg'
import iconCase from '../assets/case.svg'
import iconExecute from '../assets/execute.svg'
import iconReport from '../assets/report.svg'
import iconGuide from '../assets/guide.svg'

const activeMenu = ref('/main/home')
const currentUser = ref(localStorage.getItem('username') || '')
const router = useRouter()
const route = useRoute()
const toastShow = ref(false)
const toastMsg = ref('')
const toastType = ref('success')
const handleLogout = () => {
  clearAuth()
  toastType.value = 'success'
  toastMsg.value = '退出登录成功'
  toastShow.value = true
  router.push('/login')
}

const menuItems = [
  { name: '首页', path: '/main/home', icon: iconHome },
  { name: '配置管理', path: '/main/config', icon: iconConfig },
  { name: '用例管理', path: '/main/case', icon: iconCase },
  { name: '执行测试', path: '/main/execute', icon: iconExecute },
  { name: '测试报告', path: '/main/report', icon: iconReport },
  { name: '平台操作指南', path: '/main/guide', icon: iconGuide }
]

watch(
  () => route.path,
  (p) => {
    const hit = menuItems.find(x => x.path === p)
    activeMenu.value = hit ? hit.path : p
  },
  { immediate: true }
)

</script>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 60px;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(110, 170, 233, 0.008);
}

.header-title {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logout-btn {
  background: none;
  border: none;
  color: #ff4d4f;
  cursor: pointer;
  font-size: 16px;
}

.main-layout {
  flex: 1;
  display: flex;
  overflow: hidden;
  width: 100%;
  margin: 0 auto;
}

.sidebar {
  width: 180px;
  background-color: #f8f9fa;
  border-right: 1px solid #e8e8e8;
  padding: 20px 0;
  overflow-y: auto;
}

.menu-title {
  font-size: 18px;
  font-weight: bold;
  color: #1890ff;
  padding: 0 20px 16px;
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 16px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
}
.menu-icon {
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  object-fit: cover;
  opacity: 0.9;
}

.menu-item.active {   
  background-color: #e5edfa;
  color: #1664ff;
  border-radius: 4px;
  margin: 0 8px;
}
.menu-item.active .menu-icon {
  /* filter: brightness(0) invert(1); */
  opacity: 1;
}

.menu-item:hover:not(.active) {
  background-color: #e9ecef;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}
.content::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}
.content {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
