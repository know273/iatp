// 1. 导入路由核心API
import { createRouter, createWebHistory } from 'vue-router'
// 2. 导入需要映射的页面组件
import Home from '../components/home.vue'
import Login from '../components/login.vue'
import Main from '../components/main.vue'
import Config from '../components/config.vue'
import Case from '../components/case.vue'
import Execute from '../components/execute.vue'
import Report from '../components/report.vue'
import Guide from '../components/guide.vue'

// 3. 定义路由规则（核心：path→component的映射）
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/main',
    name: 'Main',
    component: Main,
    meta: { requiresAuth: true },
    redirect: '/main/home',
    children: [
      { path: 'home', name: 'Home', component: Home, meta: { requiresAuth: true } },
      { path: 'config', name: 'Config', component: Config, meta: { requiresAuth: true } },
      { path: 'case', name: 'Case', component: Case, meta: { requiresAuth: true } },
      { path: 'execute', name: 'Execute', component: Execute, meta: { requiresAuth: true } },
      { path: 'report', name: 'Report', component: Report, meta: { requiresAuth: true } },
      { path: 'guide', name: 'Guide', component: Guide, meta: { requiresAuth: true } }
    ]
  }
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
