// 1. 导入路由核心API
import { createRouter, createWebHistory } from 'vue-router'
// 2. 导入需要映射的页面组件
import Home from '../components/Home.vue'
import Login from '../components/login.vue'
import Main from '../components/main.vue'

// 3. 定义路由规则（核心：path→component的映射）
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  { path: '/main', name: 'Main', component: Main, meta: { requiresAuth: true } },
  { path: '/home', name: 'Home', component: Home, meta: { requiresAuth: true } }
]

// 4. 创建路由实例并配置
const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      next('/login')
      return
    }
  }
  next()
})

// 5. 导出路由实例，供main.js挂载
export default router
