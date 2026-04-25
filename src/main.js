import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index.js'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const locale = {
  ...zhCn,
  el: {
    ...(zhCn.el || {}),
    pagination: {
      ...((zhCn.el && zhCn.el.pagination) || {}),
      total: '总共 {total} 条'
    }
  }
}

createApp(App).use(router).use(ElementPlus, { locale }).mount('#app')
