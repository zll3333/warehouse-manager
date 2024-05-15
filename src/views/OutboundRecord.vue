<script setup>
import { getCurrentInstance, onMounted, reactive, ref } from 'vue';
import { useUserStore } from '../store';
const { proxy } = getCurrentInstance()
const queryForm = reactive({})
const userStore = useUserStore()
const outboundRecordList = ref([])
const columns = [
  {
    prop: 'outboundId',
    label: '出库单编号',
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
    label: '出库数量',
    formatter (row, column, value) {
      return `${value} ${row.unit}`
    },
    width: 100
  },
  {
    prop: 'position',
    label: '物资存储位置',
    width: 140
  },
  // {
  //   prop: 'remark',
  //   label: '出库用途',
  //   width: 200
  // },
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
    label: '出库时间',
    formatter (row, column, value) {
      let date = new Date(value)
      return proxy.$util.formatDateTime(date)
    },
    width: 170
  },

]
const outboundRecordForm = reactive({
  state: 1,
  applicant: userStore.userInfo.userName,
  applicantEmail: userStore.userInfo.userEmail
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
  getOutboundRecordList()
}

// 操作-查询
const handleQuery = () => {
  getOutboundRecordList()
}
// 操作-重置
const handleReset = () => {
  proxy.$refs.form.resetFields()
  getOutboundRecordList()
}
// 操作-查看
const handleLook = (row) => {
  dialogVisable.value = true

  Object.assign(outboundRecordForm, row)


}


// 请求-获取出库申请列表
const getOutboundRecordList = async () => {
  try {
    let parmas = { ...queryForm, ...pager }
    const { list, page } = await proxy.$api.getOutboundRecordList(parmas)
    outboundRecordList.value = list
    pager.total = page.total
  } catch (err) {
    throw new Error(err)
  }
}

onMounted(() => {
  getOutboundRecordList()
})
</script>
<template>
  <div class="outboundReq-manage">
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
        :data="outboundRecordList"
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
          <span class="title">出库记录单</span>
        </template>
        <p class="item">出库单编号：{{ outboundRecordForm.outboundId }}</p>
        <p class="item">物资编号：{{ outboundRecordForm.materialId }}</p>
        <p class="item">物资名称：{{ outboundRecordForm.materialName }}</p>
        <p class="item">出库数量：{{ outboundRecordForm.amount }} {{ outboundRecordForm.unit }}</p>
        <p class="item">出库物资存储位置（仓库-库位）：{{ outboundRecordForm.position }}</p>
        <p class="item">出库用途：{{ outboundRecordForm.remark }}</p>
        <p class="item">操作员：{{ outboundRecordForm.approver }}</p>
      </el-card>
      <el-card>
        <template #header>
          <span class="title">出库来源</span>
        </template>
        <p class="item">出库申请单编号：{{ outboundRecordForm.connectId[0] }}</p>
        <p class="item">申请人：{{ outboundRecordForm.applicant }}</p>
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