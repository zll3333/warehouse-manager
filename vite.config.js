import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  // 配置服务器选项
  server: {
    host: 'localhost',
    port: 8080,
    // proxy: {
    //   '/api'
    // }
  },
  plugins: [vue()],
})
