<script setup>
import { getCurrentInstance, onMounted, reactive, ref } from 'vue';
import { useUserStore } from '../store';
const { proxy } = getCurrentInstance()
const queryForm = reactive({
  state: 1
})
const userStore = useUserStore()
const inboundReqList = ref([])
const columns = [
  {
    prop: 'inboundId',
    label: '申请单编号',
    width: 120
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
    prop: 'remainAmount',
    label: '已分配入库数量',
    formatter (row, column, value) {
      return `${row.amount - value} ${row.unit}`
    },
    width: 130
  },
  {
    prop: 'vendorName',
    label: '供应商',
    width: 120
  },

  {
    prop: 'state',
    label: '当前状态',
    formatter (row, column, value) {
      return {
        1: '待审批',
        2: '已通过',
        3: '未通过'
      }[value]
    },
    width: 100,
  },
  {
    prop: 'applicant',
    label: '申请人',
    width: 100
  },
  {
    prop: 'createTime',
    label: '申请时间',
    formatter (row, column, value) {
      let date = new Date(value)
      return proxy.$util.formatDateTime(date)
    },
    width: 170
  },
]
const inboundReqForm = reactive({
  approver: userStore.userInfo.userName,
  // applicantEmail: userStore.userInfo.userEmail
})
const materialList = ref([])
const vendorList = ref([])
const warehouseList = ref([])
const action = ref()
const dialogVisable = ref(false)
const pager = reactive({
  pageSize: 10,
  pageNum: 1
})
//分页处理
const handleCurrentChange = (val) => {
  pager.pageNum = val
  // 获取列表
  getInboundApproveList()
}
const createRules = reactive({
  warehouse: [
    {
      required: true,
      message: '请选择仓库/库位',
      trigger: 'blur'
    },


  ],
  approveAmount: [
    {
      required: true,
      message: '请输入入库数量',
      trigger: 'blur'
    }
  ]
})
const approveFail = ref(false)
// 操作-查询
const handleQuery = () => {
  getInboundApproveList()
}
// 操作-重置
const handleReset = () => {
  proxy.$refs.form.resetFields()
  getInboundApproveList()
}
// 操作-查看
const handleLook = (row) => {
  dialogVisable.value = true
  action.value = 'look'
  proxy.$nextTick(() => {
    Object.assign(inboundReqForm, row, {
      material: `${row.materialId}/${row.materialName}/${row.unit}`,
      vendor: `${row.vendorId}/${row.vendorName}/${row.vendorTel}`,
      warehouseIdDetail: row.warehouseId.join('、')
    })
  })
}
// 操作-编辑
const handleEdit = (row) => {
  dialogVisable.value = true
  action.value = 'edit'
  proxy.$nextTick(() => {
    Object.assign(inboundReqForm, row, {
      material: `${row.materialId}/${row.materialName}/${row.unit}`,
      vendor: `${row.vendorId}/${row.vendorName}/${row.vendorTel}`,
    })
  })
}
// 操作-删除
const handleDel = async (row) => {
  approveFail.value = true
  action.value = 'delete'
  proxy.$nextTick(() => {
    Object.assign(inboundReqForm, row, {
      material: `${row.materialId}/${row.materialName}/${row.unit}`,
      vendor: `${row.vendorId}/${row.vendorName}/${row.vendorTel}`,
    })
  })
}
const handleSubmitApprove = () => {
  proxy.$refs.suggestRef.validate(async (valid) => {
    try {
      await proxy.$api.outboundSubmit({
        _id: inboundReqForm._id,
        action: action.value,
        suggestion: inboundReqForm.suggestion
      })
      proxy.$refs.suggestRef.resetFields()
      approveFail.value = false
      getInboundApproveList()
      proxy.$message.success('出库请求审批不通过')
    } catch (err) {
      proxy.$message.error('出库请求审批失败')
    }
  })
}
const handleApproveCancel = () => {
  approveFail.value = false
  proxy.$refs.suggestRef.resetFields()
}
// 操作-提交
const handleSubmit = () => {
  proxy.$refs.createRef.validate(async (valid) => {
    if (valid) {
      try {
        let params = { action: action.value, ...inboundReqForm, remainAmount: inboundReqForm.remainAmount - inboundReqForm.approveAmount }
        console.log(params);
        await proxy.$api.inboundSubmit(params)
        await proxy.$api.stackSubmit({
          action: 'inbound',
          materialId: params.materialId,
          materialName: params.materialName,
          vendorId: params.vendorId,
          vendorName: params.vendorName,
          stackNum: params.approveAmount,
          warehouseId: params.warehouseDetail,
          position: params.position,
          unit: params.unit
        })
        dialogVisable.value = false
        proxy.$message.success('入库审批通过')
        proxy.$message.success('入库分配成功')
        getInboundApproveList()
        getWarehouseList()
        proxy.$refs.createRef.resetFields()
      } catch (err) {
        proxy.$message.success('入库审批失败')
        throw new Error(err)
      }
    }
  })
}
// 操作-取消
const handleCancel = () => {
  dialogVisable.value = false
  proxy.$refs.createRef.resetFields()
}

// 请求-获取入库申请列表
const getInboundApproveList = async () => {
  try {
    let parmas = { ...queryForm, ...pager, userName: userStore.userInfo.userName }
    const { list, page } = await proxy.$api.getInboundApproveList(parmas)
    inboundReqList.value = list
    pager.total = page.total
  } catch (err) {
    throw new Error(err)
  }
}
// 请求-获取物资列表
const getMaterialList = async () => {
  try {
    const list = await proxy.$api.getAllMaterialList()
    materialList.value = list
  } catch (error) {
    throw new Error(error)
  }
}
// 请求-获取供应商列表
const getVendorList = async () => {
  try {
    const list = await proxy.$api.getVendorList()
    vendorList.value = list
  } catch (error) {
    throw new Error(error)
  }
}
// 请求-获取仓库列表
const getWarehouseList = async () => {
  try {
    const list = await proxy.$api.getWarehouseAllList()
    const temList = getNewWarehouseList(list)
    warehouseList.value = temList
  } catch (error) {
    throw new Error(error)
  }
}
// 工具函数-重新封装仓库列表
const getNewWarehouseList = (list) => {
  list.map((item) => {
    item.label = item.warehouseName
    item.key = item.warehouseId + '/' + item.warehouseName + '/' + item.userName
    if (item.children) {
      getNewWarehouseList(item.children)
    }
  })
  return list
}
// 选择-仓库-库位选择
const handleSelectWarehouse = (val) => {
  // console.log(val);
  let ckArr = val[0].split('/')
  let kwArr = val[1].split('/')
  Object.assign(inboundReqForm, {
    warehouseDetail: ckArr[0] + '/' + kwArr[0],
    warehouseId: [ckArr[0] + '/' + kwArr[0]],
    position: ckArr[1] + '-' + kwArr[1],
    leader: ckArr[2],
  })
}
onMounted(() => {
  getMaterialList()
  getVendorList()
  getInboundApproveList()
  getWarehouseList()
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
          prop="state"
          label="入库状态"
        >
          <el-select
            v-model="queryForm.state"
            style="width: 160px"
          >
            <el-option
              label="待审批"
              :value="1"
            ></el-option>
            <el-option
              label="已通过"
              :value="2"
            ></el-option>
            <el-option
              label="未通过"
              :value="3"
            ></el-option>
          </el-select>
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
        :data="inboundReqList"
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
          width="250"
        >
          <template #default="scope">
            <el-button
              size="small"
              @click="handleLook(scope.row)"
            >详情</el-button>
            <el-button
              size="small"
              type="primary"
              @click="handleEdit(scope.row)"
              v-if="scope.row.state===1"
            >审批通过</el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDel(scope.row)"
              v-if="scope.row.state===1"
            >不通过</el-button>
            <!-- <el-popconfirm
              title="确定要删除该申请吗?"
              @confirm="handleDel(scope.row)"
            >
              <template #reference>
                <el-button
                  type="danger"
                  size="small"
                  v-if="scope.row.state===1"
                >不通过</el-button>
              </template>
            </el-popconfirm> -->
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
      :title="action==='edit'?'入库分配':'查看详情'"
      width="600"
    >
      <el-form
        :model="inboundReqForm"
        label-width="120"
        style="margin:30px 0"
        :rules="createRules"
        ref="createRef"
      >

        <el-card
          v-if="action==='look'"
          style="padding-left:30px"
        >
          <p class="item">申请单编号：{{ inboundReqForm.inboundId }}</p>
          <p class="item">入库物资：{{ inboundReqForm.materialName }}</p>
          <p class="item">物资编号：{{ inboundReqForm.materialId }}</p>
          <p class="item">入库数量：{{ inboundReqForm.amount }} {{ inboundReqForm.unit }}</p>
          <p class="item">待分配入库数量：{{ inboundReqForm.remainAmount }} {{ inboundReqForm.unit }}</p>
          <p class="item">已分配入库数量：{{ inboundReqForm.amount-inboundReqForm.remainAmount }} {{ inboundReqForm.unit }}</p>
          <p class="item">供应商：{{ inboundReqForm.vendorName }}</p>
          <p class="item">供应商电话：{{ inboundReqForm.vendorTel }}</p>
          <p class="item">申请人：{{ inboundReqForm.applicant }}</p>
          <div v-if='inboundReqForm.state===2'>
            <hr>
            <p class="item">入库仓库编号（仓库/库位）：{{ inboundReqForm.warehouseIdDetail }}</p>
            <p class="item">具体位置（仓库-库位）：{{ inboundReqForm.position }}</p>
            <p class="item">审批人：{{ inboundReqForm.approver }}</p>
          </div>
        </el-card>

        <div
          class="detail"
          v-if="action==='edit'"
        >
          <el-space :size="40">
            <span>待分配物资：{{ inboundReqForm.materialName }}</span>
            <span>待分配物资数量：{{ inboundReqForm.remainAmount }} {{ inboundReqForm.unit }}</span>
          </el-space>
        </div>

        <el-form-item
          label="分配仓库/库位"
          prop="warehouse"
          v-if="action==='edit'"
        >
          <el-cascader
            v-model="inboundReqForm.warehouse"
            placeholder="请选择仓库/库位"
            :options="warehouseList"
            :props="{value:'key',label:'warehouseName'}"
            clearable
            style="width: 200px"
            :disabled="action==='look'"
            @change="handleSelectWarehouse"
          >
          </el-cascader>
        </el-form-item>
        <el-form-item
          label="入库数量"
          prop="approveAmount"
          v-if="action==='edit'"
        >
          <el-input-number
            v-model="inboundReqForm.approveAmount"
            :min="1"
            :max="inboundReqForm.remainAmount"
          />
        </el-form-item>
        <el-form-item
          label="仓库负责人"
          prop="leader"
          v-if="action==='edit'"
        >
          <el-input
            v-model="inboundReqForm.leader"
            disabled
          />
        </el-form-item>

      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">{{action==='look'?"关闭":"取消"}}</el-button>
          <el-button
            type="primary"
            @click="handleSubmit"
            v-if="action!=='look'"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      v-model="approveFail"
      align-center
      title="入库审批"
      width="600"
    >
      <el-form
        :model="inboundReqForm"
        label-width="120"
        style="margin:30px 0"
        ref="suggestRef"
      >
        <el-form-item
          prop="suggestion"
          label="审批意见"
        >
          <el-input
            placeholder="请输入审批不通过的意见说明"
            v-model="inboundReqForm.suggestion"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleApproveCancel">取消</el-button>
          <el-button
            type="primary"
            @click="handleSubmitApprove"
          >
            确定
          </el-button>
        </div>
      </template>
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
.detail {
  margin-bottom: 25px;
  padding-left: 20px;
  font-size: 16px;
  font-weight: 500;
}
</style>