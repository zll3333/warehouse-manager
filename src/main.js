import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import request from './utils/request'
import storage from './utils/storage'

// console.log(config);

const app = createApp(App)
// 全局挂载变量
app.config.globalProperties.$request = request
app.config.globalProperties.$storage = storage
app.use(router)
app.use(ElementPlus)

app.mount('#app')
