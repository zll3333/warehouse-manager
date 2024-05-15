import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import request from './utils/request'
import storage from './utils/storage'
import api from './api'
import { createPinia } from 'pinia'
import { ElMessage } from 'element-plus'
// console.log(config);
import util from './utils/index'

const app = createApp(App)
const pinia = createPinia()
app.use(router)

//全局指令
app.directive('has', {
  beforeMount: (el, binding) => {
    let userAction = storage.getItem("saveUserAction")
    let value = binding.value
    // 判断列表中是否有对应按钮的权限标识
    let hasPermission = userAction.includes(value)
    // console.log(value);
    if (!hasPermission) {
      el.style = 'display:none'
      setTimeout(() => {
        el.parentNode.removeChild(el)
      }, 0)
    }
  }
})
// 全局挂载变量
app.config.globalProperties.$request = request
app.config.globalProperties.$storage = storage
app.config.globalProperties.$api = api
app.config.globalProperties.$message = ElMessage
app.config.globalProperties.$util = util
app.use(ElementPlus)

app.use(pinia)


app.mount('#app')
