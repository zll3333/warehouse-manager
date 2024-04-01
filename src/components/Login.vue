<script setup>
import { useRouter } from 'vue-router';
const router = useRouter()
const goHome = () => {
  router.push('/home')
}
</script>
<template>
  <div>
    <h3>登录页</h3>
    <el-button @click="goHome">回首页</el-button>
  </div>
</template>