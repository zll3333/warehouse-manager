<script setup>
import { getCurrentInstance, onMounted, reactive, ref } from 'vue';
const { proxy } = getCurrentInstance()
const queryForm = reactive({})
const columns = [
  {
    prop: 'vendorName',
    label: '供应商名称'
  },
  {
    prop: 'contact',
    label: '联系人'
  },
  {
    prop: 'telphone',
    label: '联系电话'
  },
  {
    prop: 'address',
    label: '供应商地址'
  },
  // {
  //   prop: 'account',
  //   label: '银行账号'
  // },
  // {
  //   prop: 'bank',
  //   label: '开户行'
  // }
]
const vendorList = ref([])
const dialogVisable = ref(false)
const action = ref()
const vendorForm = reactive({})
const createRules = {
  vendorName: [
    {
      required: true,
      message: '供应商名称不能为空',
      trigger: 'blur'
    }
  ],
  contact: [
    {
      required: true,
      message: '联系人不能为空',
      trigger: 'blur'
    }
  ],
  telphone: [
    {
      pattern: /1[3-9]\d{9}/,
      message: '请输入正确的电话',
      trigger: 'blur'
    }
  ],

}
// 操作——查询
const handleQuery = () => {
  getVendorList()
}
// 重置
const handleReset = () => {
  proxy.$refs.form.resetFields()
}
// 操作——取消
const handleCancel = () => {
  dialogVisable.value = false
  proxy.$refs.createRef.resetFields()
}
// 操作——查看
const handleLook = (row) => {
  dialogVisable.value = true
  action.value = 'look'
  // 在dom更新完的下一阶段
  proxy.$nextTick(() => {
    Object.assign(vendorForm, row)
  })
}
// 操作——编辑
const handleEdit = (row) => {
  dialogVisable.value = true
  action.value = 'edit'
  // 在dom更新完的下一阶段
  proxy.$nextTick(() => {
    Object.assign(vendorForm, row)
  })
}
// 操作——删除
const handleDel = async (row) => {
  action.value = 'delete'
  try {
    await proxy.$api.vendorSubmit({ _id: row._id, action: action.value })
    getVendorList()
    proxy.$message.success('删除成功')
  } catch (err) {
    proxy.$message.error('删除失败')
  }
}
// 操作——提交
const handleSubmit = () => {
  proxy.$refs.createRef.validate(async (valid) => {
    if (valid) {
      try {
        let info = action.value === 'create' ? '创建成功' : '编辑成功'
        let params = { ...vendorForm, action: action.value }
        await proxy.$api.vendorSubmit(params)
        dialogVisable.value = false
        proxy.$message.success(info)
        getVendorList()
        proxy.$refs.createRef.resetFields()

      } catch (err) {
        // proxy.$message.error('....')
      }
    }
  })
}

// 获取供应商列表
const getVendorList = async () => {
  try {
    let list = await proxy.$api.getVendorList(queryForm)
    console.log(list);
    vendorList.value = list
  } catch (error) {
    throw new Error(error)
  }
}

onMounted(() => {
  getVendorList()
})
</script>
<template>
  <div class="vendor-manage">
    <div class="query-form">
      <el-form
        inline
        :model="queryForm"
        ref="form"
      >
        <el-form-item
          label="供应商名称"
          prop="vendorName"
        >
          <el-input
            v-model="queryForm.vendorName"
            placeholder="请输入供应商名称"
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
      <div class="action">
        <el-button
          type="primary"
          @click="dialogVisable=true;action='create'"
        >创建</el-button>
      </div>
      <el-table
        :data="vendorList"
        row-key="_id"
      >
        <el-table-column
          v-for="(item,index) in columns"
          :key="item.prop+index"
          :prop="item.prop"
          :label="item.label"
          :formatter="item.formatter"
        />
        <el-table-column
          fixed="right"
          label="操作"
          width="240"
        >
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleLook(scope.row)"
            >查看</el-button>
            <el-button
              size="small"
              @click="handleEdit(scope.row)"
            >编辑</el-button>

            <el-popconfirm
              title="确定要删除该供应商吗?"
              @confirm="handleDel(scope.row)"
            >
              <template #reference>
                <el-button
                  type="danger"
                  size="small"
                >删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog
      v-model="dialogVisable"
      align-center
      :title="action==='create'?'新增供应商':action==='edit'?'编辑供应商':'查看详情'"
      width="600"
    >
      <el-form
        :model="vendorForm"
        label-width="100"
        style="margin:30px 0"
        :rules="createRules"
        ref="createRef"
      >
        <el-form-item
          label="供应商名称"
          prop="vendorName"
        >
          <el-input
            placeholder="请输入供应商名称"
            v-model="vendorForm.vendorName"
            :disabled="action==='edit'||action==='look'"
          />
        </el-form-item>
        <el-form-item
          label="联系人"
          prop="contact"
        >
          <el-input
            placeholder="请输入联系人"
            v-model="vendorForm.contact"
            :disabled="action==='look'"
          />
        </el-form-item>
        <el-form-item
          label="联系人电话"
          prop="telphone"
        >
          <el-input
            placeholder="请输入联系人电话"
            v-model="vendorForm.telphone"
            :disabled="action==='look'"
          />
        </el-form-item>
        <el-form-item
          label="供应商地址"
          prop="address"
        >
          <el-input
            placeholder="请输入供应商地址"
            v-model="vendorForm.address"
            :disabled="action==='look'"
          />
        </el-form-item>
        <el-form-item
          label="银行卡号"
          prop="account"
        >
          <el-input
            placeholder="请输入银行卡号"
            v-model="vendorForm.account"
            :disabled="action==='look'"
          />
        </el-form-item>
        <el-form-item
          label="开户行"
          prop="bank"
        >
          <el-input
            placeholder="请输入开户行"
            v-model="vendorForm.bank"
            :disabled="action==='look'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">{{ action==='look'?'关闭':'取消' }}</el-button>
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
<style>
</style>