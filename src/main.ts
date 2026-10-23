import { createApp } from 'vue'
import App from './App.vue'
import router from './permission'
import '@/assets/global.scss'
import 'element-plus/theme-chalk/dark/css-vars.css'
import pinia from '@/store'

// 一次性清理历史模板草稿：旧草稿会在「使用模板」时覆盖模板默认内容 导致模板看起来被改坏了
if (!localStorage.getItem('md-draft-cleanup-v1')) {
  Object.keys(localStorage)
    .filter(key => key.startsWith('markdown-content-'))
    .forEach(key => localStorage.removeItem(key))
  localStorage.setItem('md-draft-cleanup-v1', '1')
}

createApp(App).use(router).use(pinia).mount('#app')
