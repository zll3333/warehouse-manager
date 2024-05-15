<script setup>
import { getCurrentInstance, onMounted, reactive, ref } from 'vue';
const { proxy } = getCurrentInstance()
const queryForm = reactive({})
const stackList = ref([])
const columns = [
  {
    prop: 'stackId',
    label: '库存编号',
  },
  {
    prop: 'materialId',
    label: '物资编号',
  },
  {
    prop: 'materialName',
    label: '物资名称',
  },
  {
    prop: 'stackNum',
    label: '库存数量',
    formatter (row, column, value) {
      return `${value} ${row.unit}`
    },
  },
  {
    prop: 'warehouseId',
    label: '存储仓库编号',
    width: 140
  },
  {
    prop: 'position',
    label: '存储位置',
    width: 150
  },
  {
    prop: 'updateTime',
    label: '库存更新时间',
    formatter (row, column, value) {
      let date = new Date(value)
      return proxy.$util.formatDateTime(date)
    },
    width: 200
  },

]
const pager = reactive({
  pageSize: 10,
  pageNum: 1
})
//分页处理
const handleCurrentChange = (val) => {
  pager.pageNum = val
  // 获取列表
  getStackList()
}

// 操作-查询
const handleQuery = () => {
  getStackList()
}
// 操作-重置
const handleReset = () => {
  proxy.$refs.form.resetFields()
  getStackList()
}

// 请求-获取库存信息列表
const getStackList = async () => {
  try {
    let parmas = { ...queryForm, ...pager }
    const { list, page } = await proxy.$api.getStackList(parmas)
    stackList.value = list
    pager.total = page.total
  } catch (err) {
    throw new Error(err)
  }
}

onMounted(() => {
  getStackList()
})
</script>
<template>
  <div class="inboundReq-manage">
    <div class="query-form">
      <el-form
        inline
        :model="queryForm"
        ref="form"
      >
        <el-form-item
          prop="materialName"
          label="物资名称"
        >
          <el-input
            v-model="queryForm.materialName"
            placeholder="请输入物资名称"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="handleQuery"
          >查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <el-table
        :data="stackList"
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
      <el-pagination
        class="pagination"
        layout="prev, pager, next"
        :total="pager.total"
        :page-size="pager.pageSize"
        @current-change="handleCurrentChange"
        background
        hide-on-single-page
      />
    </div>
    <!-- <el-dialog
      v-model="dialogVisable"
      align-center
      width="600"
    >
      <el-card>
        <template #header>
          <span class="title">入库记录单</span>
        </template>
        <p class="item">入库单编号：{{ inboundRecordForm.inboundId }}</p>
        <p class="item">物资编号：{{ inboundRecordForm.materialId }}</p>
        <p class="item">物资名称：{{ inboundRecordForm.materialName }}</p>
        <p class="item">入库数量：{{ inboundRecordForm.amount }} {{ inboundRecordForm.unit }}</p>
        <p class="item">供应商：{{ inboundRecordForm.vendorName }}</p>
        <p class="item">物资存储位置（仓库-库位）：{{ inboundRecordForm.position }}</p>
        <p class="item">操作员：{{ inboundRecordForm.approver }}</p>
      </el-card>
      <el-card>
        <template #header>
          <span class="title">入库来源</span>
        </template>
        <p class="item">入库申请单编号：{{ inboundRecordForm.connectId[0] }}</p>
        <p class="item">申请人：{{ inboundRecordForm.applicant }}</p>
      </el-card>
    </el-dialog> -->
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