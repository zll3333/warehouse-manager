<script setup>
import { getCurrentInstance, onMounted, reactive, ref } from 'vue';

const { proxy } = getCurrentInstance()
const queryForm = reactive({})
const deptList = ref([])
const dialogVisable = ref(false)
const deptForm = reactive({})
const columns = [
  {
    label: '部门名称',
    prop: 'deptName'
  },
  {
    label: '负责人',
    prop: 'userName'
  }, {
    label: '负责人邮箱',
    prop: 'userEmail'
  },
  {
    label: '创建时间',
    prop: 'createTime',
    formatter (row, column, value) {
      let date = new Date(value)
      return date.toLocaleDateString()
    }
  }
]
const rules = reactive({
  deptName: [
    {
      required: true,
      message: '请输入部门名称',
      trigger: 'blur'
    }
  ]
})
const action = ref()
const userList = ref([])
// 部门列表
const getDeptList = async () => {
  try {
    let list = await proxy.$api.getDeptList(queryForm)
    deptList.value = list
  } catch (error) {
    throw new Error(error)
  }

}
// 查询
const handleQuery = () => {
  getDeptList()
}
// 重置
const handleReset = () => {
  proxy.$refs.form.resetFields()
}
const handleEdit = async (row) => {
  dialogVisable.value = true
  action.value = 'edit'
  // 在dom更新完的下一阶段
  proxy.$nextTick(() => {
    Object.assign(deptForm, row, {
      user: `${row.userId}/${row.userName}/${row.userEmail}`
    })
  })
}
const handleLook = async (row) => {
  dialogVisable.value = true
  action.value = 'look'
  // 在dom更新完的下一阶段
  proxy.$nextTick(() => {
    Object.assign(deptForm, row, {
      user: `${row.userId}/${row.userName}/${row.userEmail}`
    })
  })
}
const handleDel = async (row) => {
  action.value = 'delete'
  try {
    await proxy.$api.deptSubmit({ _id: row._id, action: action.value })
    getDeptList()
    proxy.$message.success('删除成功')
  } catch (err) {
    proxy.$message.error('删除失败')
  }

}
const handleSubmit = () => {
  proxy.$refs.deptRef.validate(async (valid) => {
    if (valid) {
      try {
        let info = action.value === 'create' ? '创建成功' : '编辑成功'
        let params = { ...deptForm, action: action.value, }
        await proxy.$api.deptSubmit(params)
        dialogVisable.value = false
        proxy.$message.success(info)
        getDeptList()
        proxy.$refs.roleRef.resetFields()

      } catch (err) {
        // proxy.$message.error('....')
      }
    }
  })
}
const handleCancel = () => {
  dialogVisable.value = false
  proxy.$refs.deptRef.resetFields()
}
const getUserList = async () => {
  try {
    let list = await proxy.$api.getUserAllList()
    userList.value = list
  } catch (error) {
    throw new Error(error)
  }
}
const handleSelect = (val) => {
  if (val) {
    const [userId, userName, userEmail] = val.split('/')
    Object.assign(deptForm, { userId, userName, userEmail })
  }
}
onMounted(() => {
  getUserList()
  getDeptList()
})
</script>
<template>
  <div class="dept-manage">
    <div class="query-form">
      <el-form
        inline
        :model="queryForm"
        ref="form"
      >
        <el-form-item
          label="部门名称"
          prop="deptName"
        >
          <el-input
            v-model="queryForm.deptName"
            placeholder="请输入部门名称"
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
          v-has="'dept-add'"
        >创建</el-button>
      </div>

      <el-table
        :data="deptList"
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
              v-has="'dept-query'"
            >查看</el-button>
            <el-button
              size="small"
              @click="handleEdit(scope.row)"
              v-has="'dept-edit'"
            >编辑</el-button>

            <el-popconfirm
              title="确定要删除该部门吗?"
              @confirm="handleDel(scope.row)"
            >
              <template #reference>
                <el-button
                  type="danger"
                  size="small"
                  v-has="'dept-del'"
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
      :title="action==='create'?'创建部门':action==='edit'?'编辑部门':'查看详情'"
      width="600"
    >
      <el-form
        :model="deptForm"
        label-width="100"
        style="margin:30px 0"
        :rules="rules"
        ref="deptRef"
      >
        <el-form-item
          label="部门名称"
          prop="deptName"
        >
          <el-input
            placeholder="请输入部门名称"
            v-model="deptForm.deptName"
            :disabled="action==='look'||action==='edit'"
          />
        </el-form-item>
        <el-form-item
          label="负责人"
          prop="user"
        >
          <el-select
            placeholder="请选择负责人"
            v-model="deptForm.user"
            @change="handleSelect"
            :disabled="action==='look'"
          >
            <el-option
              v-for="item in userList"
              :key="item.userId"
              :label="item.userName"
              :value="`${item.userId}/${item.userName}/${item.userEmail}`"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="负责人邮箱"
          prop="userEmail"
        >
          <el-input
            v-model="deptForm.userEmail"
            disabled
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">{{action==='look'?'关闭':'取消'}}</el-button>
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