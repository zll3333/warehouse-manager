<script setup>
import { useRouter } from 'vue-router';
const router = useRouter()
const goBack = () => {
  router.push('/home'); // 跳转到首页  
}
</script>
<template>
  <div class="not-found-page">
    <el-card class="card">
      <div
        slot="header"
        class="clearfix"
        style="margin-bottom:15px"
      >
        <h1 style="font-size:60px;margin-bottom:20px">404</h1>
        <div style="font-size:25px">页面未找到</div>
      </div>
      <div>
        <p>功能尚未开发，请耐心等待...</p>
        <el-button
          type="primary"
          @click="goBack"
          style="margin-top:20px"
        >返回首页</el-button>
      </div>
    </el-card>
  </div>
</template>  
  
<style lang="scss" scoped>
.not-found-page {
  text-align: center;
  padding: 20px;
}

.card {
  margin: 100px auto;
  width: 400px;
  height: 250px;
}
</style>>  

