<script setup>
import { getCurrentInstance, onMounted, reactive, ref } from 'vue';
import { useUserStore } from '../store';
const { proxy } = getCurrentInstance()
const queryForm = reactive({
  state: 1
})
const userStore = useUserStore()
const outboundReqList = ref([])
const stackList = ref([])
const columns = [
  {
    prop: 'outboundId',
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
    label: '出库数量',
    formatter (row, column, value) {
      return `${value} ${row.unit}`
    },
    width: 100
  },
  {
    prop: 'remainAmount',
    label: '已分配出库数量',
    formatter (row, column, value) {
      return `${row.amount - value} ${row.unit}`
    },
    width: 130
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
const outboundReqForm = reactive({
  approver: userStore.userInfo.userName,
  // applicantEmail: userStore.userInfo.userEmail

})
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
  getOutboundApproveList()
}
const createRules = reactive({
  warehouse: [
    {
      required: true,
      message: '请选择仓库/库位',
      trigger: 'blur'
    }
  ]
})
// const handleSelectMaterial = (val) => {
//   const [materialId, materialName, unit] = val.split('/')
//   Object.assign(outboundReqForm, { materialId, materialName, unit })
// }
// const handleSelectVendor = (val) => {
//   const [vendorId, vendorName, vendorTel] = val.split('/')
//   Object.assign(outboundReqForm, { vendorId, vendorName, vendorTel })
// }
// 操作-查询
const handleQuery = () => {
  getOutboundApproveList()
}
// 操作-重置
const handleReset = () => {
  proxy.$refs.form.resetFields()
  getOutboundApproveList()
}
// 操作-查看
const handleLook = (row) => {
  dialogVisable.value = true
  action.value = 'look'
  proxy.$nextTick(() => {
    Object.assign(outboundReqForm, row, {
      material: `${row.materialId}/${row.materialName}/${row.unit}`,
      warehouseIdDetail: [...row.warehouseId].join('、')
    })
  })
}
// 操作-编辑
const handleEdit = (row) => {
  getStackList({ materialId: row.materialId })
  // console.log(stackList.value);
  dialogVisable.value = true
  action.value = 'edit'
  proxy.$nextTick(() => {
    Object.assign(outboundReqForm, row, {
      material: `${row.materialId}/${row.materialName}/${row.unit}`,
      vendor: `${row.vendorId}/${row.vendorName}/${row.vendorTel}`,
    })
  })

}
const approveFail = ref(false)
// 操作-删除
const handleDel = async (row) => {
  approveFail.value = true
  action.value = 'delete'
  proxy.$nextTick(() => {
    Object.assign(outboundReqForm, row, {
      material: `${row.materialId}/${row.materialName}/${row.unit}`,
      vendor: `${row.vendorId}/${row.vendorName}/${row.vendorTel}`,
    })
  })

}
const handleSubmitApprove = () => {
  proxy.$refs.suggestRef.validate(async (valid) => {
    if (valid) {
      try {
        await proxy.$api.outboundSubmit({
          _id: outboundReqForm._id, action: action.value,
          suggestion: outboundReqForm.suggestion
        })
        proxy.$refs.suggestRef.resetFields()
        approveFail.value = false
        getOutboundApproveList()
        proxy.$message.success('出库请求审批不通过')
      } catch (err) {
        proxy.$message.error('出库请求审批失败')
      }
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
        let params = { action: action.value, ...outboundReqForm }
        await proxy.$api.outboundSubmit(params)
        await proxy.$api.stackSubmit({
          action: 'outbound',
          materialId: params.materialId,
          materialName: params.materialName,
          stackNum: params.approveAmount,
          warehouseId: params.warehouseDetail,
          position: params.position,
          unit: params.unit
        })
        dialogVisable.value = false
        proxy.$message.success('出库审批通过')
        proxy.$message.success('出库分配成功')
        getOutboundApproveList()
        proxy.$refs.createRef.resetFields()
      } catch (err) {
        proxy.$message.success('出库审批失败')
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


// 请求-获取出库申请列表
// const getOutboundApproveList = async () => {
//   try {
//     let parmas = { ...queryForm, ...pager }
//     const { list, page } = await proxy.$api.getOutboundApproveList(parmas)
//     outboundReqList.value = list
//     pager.total = page.total
//   } catch (err) {
//     throw new Error(err)
//   }
// }

const getStackList = async (params) => {
  try {
    const list = await proxy.$api.getStackAllList(params)
    stackList.value = handleStackList(list)
  } catch (error) {
    throw new Error(error)
  }
}
// 请求-获取入库申请列表
const getOutboundApproveList = async () => {
  try {
    let parmas = { ...queryForm, ...pager, userName: userStore.userInfo.userName }
    const { list, page } = await proxy.$api.getOutboundApproveList(parmas)
    outboundReqList.value = list
    pager.total = page.total
  } catch (err) {
    throw new Error(err)
  }
}
// 将库存信息处理为可用的列表
const handleStackList = (list) => {
  let newList = []
  list.map(item => {
    const [parent, child] = item.warehouseId.split('/')
    const [parentName, childName] = item.position.split('-')
    const stack = item.stackNum
    let flag = true
    newList.map((item) => {
      if (parent === item.warehouseId) {
        flag = false
        item.remainStack = item.remainStack + stack
        item.key = parent + '/' + parentName + '/' + item.remainStack,
          item.label = parentName + "  " + '剩余库存：' + item.remainStack,
          item.children.push({
            warehouseId: child,
            warehouseName: childName,
            remianStack: stack,
            key: child + '/' + childName + '/' + stack,
            label: childName + "  " + '剩余库存：' + stack
          })
      }
    })
    if (flag) {
      newList.push({
        warehouseId: parent,
        warehouseName: parentName,
        key: parent + '/' + parentName + '/' + stack,
        label: parentName + "  " + '剩余库存：' + stack,
        remainStack: stack,
        children: [
          {
            warehouseId: child,
            warehouseName: childName,
            remainStack: stack,
            key: child + '/' + childName + '/' + stack,
            label: childName + "  " + '剩余库存：' + stack
          }
        ]
      })
    }

  })
  return newList
}
// 选择-仓库-库位选择
const handleSelectWarehouse = (val) => {
  console.log(val);
  let ckArr = val[0].split('/')
  let kwArr = val[1].split('/')
  let approveAmount = Number(kwArr[2]) >= outboundReqForm.remainAmount ? outboundReqForm.remainAmount : Number(kwArr[2])
  Object.assign(outboundReqForm, {
    warehouseDetail: ckArr[0] + '/' + kwArr[0],
    warehouseId: [ckArr[0] + '/' + kwArr[0]],
    position: ckArr[1] + '-' + kwArr[1],
    approveAmount
  })
}
// 查询当前需要出库的物资的库存信息

onMounted(() => {
  getOutboundApproveList()
  getOutboundApproveList()
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
      :title="action==='edit'?'出库分配':'查看详情'"
      width="600"
    >
      <el-form
        :model="outboundReqForm"
        label-width="120"
        style="margin:30px 0"
        :rules="createRules"
        ref="createRef"
      >

        <el-card
          v-if="action==='look'"
          style="padding-left:30px"
        >
          <p class="item">申请单编号：{{ outboundReqForm.outboundId }}</p>
          <p class="item">出库物资：{{ outboundReqForm.materialName }}</p>
          <p class="item">物资编号：{{ outboundReqForm.materialId }}</p>
          <p class="item">出库数量：{{ outboundReqForm.amount }} {{ outboundReqForm.unit }}</p>
          <p class="item">待分配出库数量：{{ outboundReqForm.remainAmount }} {{ outboundReqForm.unit }}</p>
          <p class="item">已分配出库数量：{{ outboundReqForm.amount-outboundReqForm.remainAmount }} {{ outboundReqForm.unit }}</p>
          <p class="item">申请人：{{ outboundReqForm.applicant }}</p>
          <div v-if='outboundReqForm.state===2'>
            <hr>
            <p class="item">出库仓库编号（仓库/库位）：{{ outboundReqForm.warehouseIdDetail }}</p>
            <p class="item">具体位置（仓库-库位）：{{ outboundReqForm.position }}</p>
            <p class="item">审批人：{{ outboundReqForm.approver }}</p>
          </div>
        </el-card>

        <div
          class="detail"
          v-if="action==='edit'"
        >
          <el-space :size="40">
            <span>待出库物资：{{ outboundReqForm.materialName }}</span>
            <span>待出库物资数量：{{ outboundReqForm.remainAmount }} {{ outboundReqForm.unit }}</span>
          </el-space>
        </div>

        <el-form-item
          label="出货仓库/库位"
          prop="warehouse"
          v-if="action==='edit'"
        >

          <el-space :size="20">
            <el-cascader
              v-model="outboundReqForm.warehouse"
              placeholder="请选择出货仓库/库位"
              :options="stackList"
              :props="{value:'key',label:'warehouseName'}"
              clearable
              style="width: 200px"
              :disabled="action==='look'"
              @change="handleSelectWarehouse"
            >
              <template #default="{ node, data }">
                <span>{{ data.label }}</span>
              </template>
            </el-cascader>
          </el-space>
        </el-form-item>
        <el-form-item
          label="出库数量"
          prop="approveAmount"
          v-if="action==='edit'"
        >
          <el-input-number
            v-model="outboundReqForm.approveAmount"
            :min="1"
            :max="outboundReqForm.remainAmount"
          />
        </el-form-item>

        <!-- <el-form-item
          label="仓库负责人"
          prop="leader"
          v-if="action==='edit'"
        >
          <el-input
            v-model="outboundReqForm.leader"
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
    <el-dialog
      v-model="approveFail"
      align-center
      title="出库审批"
      width="600"
    >
      <el-form
        :model="outboundReqForm"
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
            v-model="outboundReqForm.suggestion"
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