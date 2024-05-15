<script setup>
import { getCurrentInstance, onMounted, reactive, ref } from 'vue';
import { useUserStore } from '../store';
const { proxy } = getCurrentInstance()
const queryForm = reactive({
  state: 1
})
const userStore = useUserStore()
const outboundReqList = ref([])
const columns = [
  {
    prop: 'outboundId',
    label: '申请单编号',
    width: 120
  },
  {
    prop: 'materialId',
    label: '物资编号'
  },
  {
    prop: 'materialName',
    label: '物资名称'
  },
  {
    prop: 'amount',
    label: '出库数量',
    formatter (row, column, value) {
      return `${value} ${row.unit}`
    }
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
  {
    prop: 'state',
    label: '当前状态',
    formatter (row, column, value) {
      return {
        1: '申请中',
        2: '已通过',
        3: '未通过'
      }[value]
    }
  }
]
const outboundReqForm = reactive({
  state: 1,
  applicant: userStore.userInfo.userName,
  applicantEmail: userStore.userInfo.userEmail
})
const materialList = ref([])
const vendorList = ref([])
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
  getOutboundReqList()
}
const createRules = reactive({
  material: [
    { required: true, message: '请选择出库物资', trigger: 'blur' }
  ],
  amount: [
    { required: true, message: '请输入出库物资数量', trigger: 'blur' }
  ]
})
const handleSelectMaterial = (val) => {
  const [materialId, materialName, unit] = val.split('/')
  Object.assign(outboundReqForm, { materialId, materialName, unit })
}
const handleSelectApprover = (val) => {
  const [userName, userEmail] = val.split('/')
  Object.assign(outboundReqForm, { approver: userName, approverEmail: userEmail })
}
// 操作-查询
const handleQuery = () => {
  getOutboundReqList()
}
// 操作-重置
const handleReset = () => {
  proxy.$refs.form.resetFields()
  getOutboundReqList()
}
// 操作-查看
const handleLook = (row) => {
  dialogVisable.value = true
  action.value = 'look'
  proxy.$nextTick(() => {
    Object.assign(outboundReqForm, row, {
      material: `${row.materialId}/${row.materialName}/${row.unit}`,
      vendor: `${row.vendorId}/${row.vendorName}/${row.vendorTel}`,
      approverDetail: `${row.approver}/${row.approverEmail}`
    })
  })
}
// 操作-编辑
const handleEdit = (row) => {
  dialogVisable.value = true
  action.value = 'edit'
  proxy.$nextTick(() => {
    Object.assign(outboundReqForm, row, {
      material: `${row.materialId}/${row.materialName}/${row.unit}`,
      vendor: `${row.vendorId}/${row.vendorName}/${row.vendorTel}`,
      approverDetail: `${row.approver}/${row.approverEmail}`
    })
  })
}
// 操作-删除
const handleDel = async (row) => {
  action.value = 'delete'
  try {
    await proxy.$api.outboundReqSubmit({ _id: row._id, action: action.value })
    getOutboundReqList()
    proxy.$message.success('删除成功')
  } catch (err) {
    proxy.$message.error('删除失败')
  }
}
// 操作-提交
const handleSubmit = () => {
  proxy.$refs.createRef.validate(async (valid) => {
    if (valid) {
      try {
        let info = action.value === 'create' ? '创建成功' : '编辑成功'
        let params = { action: action.value, ...outboundReqForm }
        await proxy.$api.outboundReqSubmit(params)
        dialogVisable.value = false
        proxy.$message.success(info)
        getOutboundReqList()
        proxy.$refs.createRef.resetFields()
      } catch (err) {
        proxy.$message.error('创建失败')
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
const getOutboundReqList = async () => {
  try {
    let parmas = { ...queryForm, ...pager }
    const { list, page } = await proxy.$api.getOutboundReqList(parmas)
    outboundReqList.value = list
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
    console.log(materialList.value);
  } catch (error) {
    throw new Error(error)
  }
}
const getVendorList = async () => {
  try {
    const list = await proxy.$api.getVendorList()
    vendorList.value = list
  } catch (error) {
    throw new Error(error)
  }
}
// 请求-获取审批人列表（只有系统管理员和仓库管理员能够进行审批）
const approverList = ref([])
const getApproverList = async () => {
  try {
    const list = await proxy.$api.getApproverList()
    approverList.value = list
  } catch (error) {
    throw new Error(error)
  }
}
onMounted(() => {
  getMaterialList()
  getVendorList()
  getOutboundReqList()
  getApproverList()
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
          prop="state"
          label="出库状态"
        >
          <el-select
            v-model="queryForm.state"
            style="width: 160px"
          >
            <el-option
              label="申请中"
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
      <div class="action">
        <el-button
          type="primary"
          @click="dialogVisable=true;action='create'"
        >申请出库</el-button>
      </div>
      <el-table
        :data="outboundReqList"
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
          width="240"
        >
          <template #default="scope">
            <el-button
              size="small"
              @click="handleEdit(scope.row)"
              v-if="scope.row.state===1"
            >编辑</el-button>

            <el-popconfirm
              title="确定要删除该申请吗?"
              @confirm="handleDel(scope.row)"
            >
              <template #reference>
                <el-button
                  type="danger"
                  size="small"
                  v-if="scope.row.state===1"
                >删除</el-button>
              </template>
            </el-popconfirm>
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
      :title="action==='create'?'创建出库申请单':action==='edit'?'编辑出库申请单':'查看详情'"
      width="600"
    >
      <el-form
        :model="outboundReqForm"
        label-width="100"
        style="margin:30px 0"
        :rules="createRules"
        ref="createRef"
      >
        <el-form-item
          label="出库物资"
          prop="material"
        >
          <el-select
            placeholder="请选择出库物资"
            v-model="outboundReqForm.material"
            style="width: 200px"
            @change="handleSelectMaterial"
            :disabled="action==='look'"
          >
            <el-option
              v-for="item in materialList"
              :key="item.materialId"
              :label="item.materialName"
              :value="`${item.materialId}/${item.materialName}/${item.unit}`"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="出库数量"
          prop="amount"
        >
          <el-input-number
            v-model="outboundReqForm.amount"
            :disabled="action==='look'"
          />
        </el-form-item>
        <el-form-item
          label="备注"
          prop="remark"
        >
          <el-input
            type="textarea"
            rows="2"
            v-model="outboundReqForm.remark"
            placeholder="请备注申请该物资出库的用途"
            :disabled="action==='look'"
          />
        </el-form-item>
        <el-form-item
          label="审批人"
          prop="approver"
        >
          <el-select
            placeholder="请选择审批人"
            v-model="outboundReqForm.approverDetail"
            @change="handleSelectApprover"
            :disabled="action==='look'"
          >
            <el-option
              v-for="item in approverList"
              :key="item.userId"
              :label="item.userName"
              :value="`${item.userName}/${item.userEmail}`"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="审批人邮箱"
          prop="approverEmail"
        >
          <el-input
            v-model="outboundReqForm.approverEmail"
            disabled
          />
        </el-form-item>
        <!-- <el-form-item
          label="申请人"
          prop="applicant"
        >
          <el-input
            v-model="outboundReqForm.applicant"
            disabled
          />
        </el-form-item>
        <el-form-item
          label="申请人邮箱"
          prop="applicantEmail"
        >
          <el-input
            v-model="outboundReqForm.applicantEmail"
            disabled
          />
        </el-form-item> -->

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
  </div>
</template>
