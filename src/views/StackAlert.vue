<script setup>
import { getCurrentInstance, onMounted, reactive, ref } from 'vue';
import { useUserStore } from '../store';
const { proxy } = getCurrentInstance()

const alertList = ref([])
const columns = [
  {
    prop: 'materialId',
    label: '物资编号',
  },
  {
    prop: 'materialName',
    label: '物资名称',
  },
  {
    prop: 'materialType',
    label: '物资类型',
    formatter (row, column, value) {
      return {
        1: '设备及其零部件',
        2: '燃料',
        3: '安全防护用品',
        4: '其他'
      }[value]
    }
  },
  {
    prop: 'safeStack',
    label: '安全库存量',
    formatter (row, column, value) {
      return `${value} ${row.unit}`
    }
  },
  {
    prop: 'stackNum',
    label: '库存数量',
    formatter (row, column, value) {
      return `${value} ${row.unit}`
    },
  },



]

// 请求-获取库存信息列表
const getAlertList = async () => {
  try {
    let list = await proxy.$api.getAlertList()
    alertList.value = list

  } catch (err) {
    throw new Error(err)
  }
}

onMounted(() => {
  getAlertList()
})
</script>
<template>
  <div class="stackAlert-manage">

    <div style="padding:10px;background-color:#fff;">
      <el-alert
        title="以下物资库存量不满足安全库存需求，请联系采购人员及时补充库存！！！"
        type="warning"
        :closable="false"
      />
    </div>

    <div class="base-table">
      <el-table
        :data="alertList"
        row-key="_id"
      >
        <el-table-column
          v-for="(item,index) in columns"
          :key="item.prop+index"
          :prop="item.prop"
          :label="item.label"
          :formatter="item.formatter"
          :width="item.width"
        />
      </el-table>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.item {
  height: 40px;
  line-height: 40px;
  font-size: 16px;
  color: #666;
}
.title {
  color: #444;
  font-size: 16px;
  font-weight: 500;
}
</style>