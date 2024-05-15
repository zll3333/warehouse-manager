<script setup>
import { getCurrentInstance, onMounted, reactive, ref } from 'vue';
import { useUserStore } from '../store';
const { proxy } = getCurrentInstance()
const queryForm = reactive({})
const userStore = useUserStore()
const inboundRecordList = ref([])
const columns = [
  {
    prop: 'inboundId',
    label: '入库单编号',
    width: 100
  },
  {
    prop: 'materialId',
    label: '物资编号',
    width: 100
  },
  {
    prop: 'materialName',
    label: '物资名称',
    width: 100
  },
  {
    prop: 'amount',
    label: '入库数量',
    formatter (row, column, value) {
      return `${value} ${row.unit}`
    },
    width: 100
  },
  {
    prop: 'vendorName',
    label: '供应商',
    width: 100

  },
  {
    prop: 'position',
    label: '物资存储位置',
    width: 140
  },
  {
    prop: 'approver',
    label: '操作员'
  },
  {
    prop: 'applicant',
    label: '申请人'
  },
  {
    prop: 'createTime',
    label: '入库时间',
    formatter (row, column, value) {
      let date = new Date(value)
      return proxy.$util.formatDateTime(date)
    },
    width: 170
  },

]
const inboundRecordForm = reactive({
  state: 1,
  // applicant: userStore.userInfo.userName,
  // applicantEmail: userStore.userInfo.userEmail
})
const dialogVisable = ref(false)
const pager = reactive({
  pageSize: 10,
  pageNum: 1
})
//分页处理
const handleCurrentChange = (val) => {
  pager.pageNum = val
  // 获取列表
  getInboundRecordList()
}

// 操作-查询
const handleQuery = () => {
  getInboundRecordList()
}
// 操作-重置
const handleReset = () => {
  proxy.$refs.form.resetFields()
  getInboundRecordList()
}
// 操作-查看
const handleLook = (row) => {
  dialogVisable.value = true

  Object.assign(inboundRecordForm, row)


}


// 请求-获取入库申请列表
const getInboundRecordList = async () => {
  try {
    let parmas = { ...queryForm, ...pager }
    const { list, page } = await proxy.$api.getInboundRecordList(parmas)
    inboundRecordList.value = list
    pager.total = page.total
  } catch (err) {
    throw new Error(err)
  }
}

onMounted(() => {
  getInboundRecordList()
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
        :data="inboundRecordList"
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
        <el-table-column
          fixed="right"
          label="操作"
          width="120"
        >
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleLook(scope.row)"
            >查看详情</el-button>
          </template>
        </el-table-column>
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
    <el-dialog
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
    </el-dialog>
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