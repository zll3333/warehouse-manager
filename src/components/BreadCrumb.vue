<script setup>
import { ArrowRight } from '@element-plus/icons-vue'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
const routes = useRoute()
// 面包屑列表
const breadList = computed(() => {
  return routes.matched
})
onMounted(() => {
  // console.log(routes.matched);
})
</script>

<template>
  <el-breadcrumb :separator-icon="ArrowRight">
    <el-breadcrumb-item
      v-for="(item,index) in breadList"
      :key="item.path"
    >
      <router-link
        to="/home"
        v-if="index==0"
      >{{ item.meta.title }}</router-link>
      <span v-else>{{item.meta.title}}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>