import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  // 配置服务器选项
  server: {
    host: 'localhost',
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:3000/",
        // changeOrigin: true
      }
    }
  },
  // resolve: {
  //   alias: {
  //     '@': path.resolve(__dirname, './src')
  //   }
  // },
  plugins: [vue()],
})
