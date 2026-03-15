<!-- App.vue -->
<template>
  <div class="app-container">
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const activeMenu = ref('/main/home')
const currentUser = ref(localStorage.getItem('username') || '')
const router = useRouter()
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  router.push('/login')
}

const menuItems = [
  { name: '首页', path: '/main/home' },
  { name: '配置管理', path: '/main/config' },
  { name: '用例管理', path: '/main/case' },
  { name: '执行测试', path: '/main/execute' },
  { name: '测试报告', path: '/main/report' },
  { name: '平台操作指南', path: '/main/guide' }
]

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
  padding: 12px 20px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
}

.menu-item.active {
  background-color: #6f42c1;
  color: #fff;
  border-radius: 4px;
  margin: 0 8px;
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
