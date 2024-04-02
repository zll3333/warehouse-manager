<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getCurrentInstance } from 'vue';
const { proxy } = getCurrentInstance()
const router = useRouter()
const goHome = () => {
  router.push('/home')
}

onMounted(() => {
  proxy.$request.get('/login', { name: 'jack' })
})
</script>
<template>
  <div>
    <h3>登录页</h3>
    <el-button @click="goHome">回首页</el-button>
  </div>
</template>