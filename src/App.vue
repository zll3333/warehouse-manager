<script setup>
import { onMounted } from 'vue';
import { getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()
onMounted(() => {
  // proxy.$storage.setItem('name', 'tome')

})
</script>

<template>
  <router-view></router-view>
</template>

<style>
@import url("./assets/styles/index.scss");
@import url("./assets/styles/reset.css");
@import url("./assets/font/iconfont.css");
</style>
