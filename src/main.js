import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import axios from 'axios'
import config from './config'

console.log(import.meta.env);
axios.get(config.mockApi + '/login').then((res) => {
  console.log(res);
})

const app = createApp(App)
app.use(router)
app.use(ElementPlus)

app.mount('#app')
