<script setup>
import {
  DocumentChecked,
  Setting,
  Monitor,
  User,
  Memo,
  ShoppingTrolley,
  Bell,
  DataAnalysis,
  DataLine,
  FolderAdd,
  FolderDelete,
  MessageBox
} from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
const props = defineProps(
  {
    isCollapse: Boolean,
    menuList: Array
  }
)
const activeIndex = ref("")
const router = useRouter()
const handleOpen = (index, path) => {
  // console.log(index, path)
  // console.log(props.menuList);
}
function getActiveIndex () {
  const index = router.currentRoute.value.path.split('/')[1]
  activeIndex.value = index
  // console.log(activeIndex.value);
}
onMounted(() => {
  getActiveIndex()
})
</script>
<template>
  <el-menu
    default-active="2"
    class="el-menu"
    background-color="#001529"
    text-color="#fff"
    :default-active="activeIndex"
    :collapse="isCollapse"
    @click="handleOpen"
    router
    unique-opened
  >
    <template v-for="menu in menuList">
      <el-sub-menu
        v-if="menu.children&&menu.children.length>0&&menu.children[0].menuType===1"
        :index="menu.path"
      >
        <template #title>
          <el-icon>
            <Setting v-if="menu.icon==='Setting'" />
            <FolderDelete v-if="menu.icon==='FolderDelete'" />
            <FolderAdd v-if="menu.icon==='FolderAdd'" />
            <User v-if="menu.icon==='User'" />
            <DataAnalysis v-if="menu.icon==='DataAnalysis'" />
            <DataLine v-if="menu.icon==='DataLine'" />
            <MessageBox v-if="menu.icon==='MessageBox'" />
          </el-icon>
          <span>{{menu.menuName}}</span>
        </template>
        <tree-menu
          :menuList="menu.children"
          style="margin-left:35px"
        />
      </el-sub-menu>
      <el-menu-item
        v-else-if="menu.menuType===1"
        :index="menu.path"
        :key="menu._id"
      >{{menu.menuName}}</el-menu-item>
    </template>
  </el-menu>
</template>