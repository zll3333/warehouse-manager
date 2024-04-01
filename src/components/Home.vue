<script setup>
import { useRouter } from 'vue-router';
const router = useRouter()
const goLogin = () => {
  router.push("/login")
}
</script>
<template>
  <div>
    HelloWorld
    <el-button @click="goLogin">去登陆</el-button>
  </div>
</template>
