<script setup>
import { onMounted, reactive, ref, toRaw } from 'vue';
import { getCurrentInstance } from 'vue';
const { proxy } = getCurrentInstance()

const userList = ref([])
const roleList = ref([])
const deptList = ref([])
const form = ref()
// 初始化查询条件
const searchUser = reactive({
  state: 0
})
// 初始化新增用户
const userForm = reactive({
  state: 1,
  sex: 0
})
// 新增用户表单规则
const createRules = reactive({
  userName: [
    {
      required: true,
      message: '请输入用户名',
      trigger: 'blur'
    }
  ],
  userEmail: [
    {
      required: true,
      message: '请输入用户邮箱',
      trigger: 'blur'
    }
  ],
  mobile: {
    pattern: /1[3-9]\d{9}/,
    message: '请输入正确的手机号格式',
    trigger: 'blur'
  },
  deptId: [
    {
      required: true,
      message: '请输入选择所属部门',
      trigger: 'blur'
    }
  ]
})
// 选中用户列表的对象
const checkedUserIds = ref([])
const pager = reactive({
  pageNum: 1,
  pageSize: 10
})
const columns = reactive([
  {
    prop: 'userId',
    label: '用户ID'
  },
  {
    prop: 'userName',
    label: '用户名称'
  },
  {
    prop: 'userEmail',
    label: '用户邮箱',
  },
  {
    prop: 'sex',
    label: '性别',
    formatter (row, column, value) {
      return {
        0: '男',
        1: '女'
      }[value]
    }
  },
  {
    prop: 'mobile',
    label: '电话'
  },
  {
    prop: 'roleName',
    label: '系统角色',
  },
  {
    prop: 'state',
    label: '状态',
    formatter (row, column, value) {
      return {
        1: '在职',
        2: '离职',
      }[value]
    }
  },
  {
    prop: 'createTime',
    label: '注册时间',
    formatter (row, column, value) {
      let date = new Date(value)
      return date.toLocaleDateString()
      // return proxy.$util.formatDateTime(date)
    }
  },
])
// 对话框
const dialogVisable = ref(false)
const action = ref()
// 获取用户列表
async function getUserList () {
  try {
    let parmas = { ...searchUser, ...pager }
    const { list, page } = await proxy.$api.getUserList(parmas)
    userList.value = list
    pager.total = page.total
  } catch (err) {
    throw new Error(err)
  }
}
// 查询,获取用户列表
const handleQuery = () => {
  getUserList()

}
// 重置查询表单
function handleReset (formEl) {
  if (!formEl) return
  formEl.resetFields()
  getUserList()
}

// 删除单个用户
const handleDel = async (row) => {
  try {
    await proxy.$api.deleteUser({
      userIds: [row.userId]
    })
    // console.log(row.userId)
    proxy.$message.success('删除成功')
    getUserList()
  } catch (err) {
    proxy.$message.error('删除失败')
  }
}
// 批量删除
const handlePatchDel = async () => {
  try {
    if (checkedUserIds.value.length === 0) {
      proxy.$message.error('请选择要删除的用户')
      return
    }
    const res = await proxy.$api.deleteUser({
      userIds: checkedUserIds.value
    })
    if (res.nModified > 0) {
      proxy.$message.success('删除成功')
      getUserList()
    } else {
      proxy.$message.error('删除失败')
    }
  } catch (err) {
    proxy.$message.error('删除失败')
  }

}
// 选择对象
const handleSelectionChange = (list) => {
  let arr = []
  list.forEach(element => {
    arr.push(element.userId)
  });
  checkedUserIds.value = arr
  // console.log(checkedUserIds.value);
}
const handleSubmit = () => {
  proxy.$refs.createRef.validate(async (valid) => {
    if (valid) {
      try {
        let info = action.value === 'create' ? '创建成功' : '编辑成功'
        let params = toRaw(userForm)
        params.userEmail += "@fire.com"
        params.action = action.value
        await proxy.$api.userSubmit(params)
        dialogVisable.value = false
        proxy.$message.success(info)
        getUserList()
        proxy.$refs.createRef.resetFields()
      } catch (err) {
        proxy.$message.error('创建失败')
        throw new Error(err)
      }
    }
  })
}
// 分页处理
const handleCurrentChange = (val) => {
  pager.pageNum = val
  getUserList()
}
// 编辑
const handleEdit = (row) => {
  dialogVisable.value = true
  action.value = 'edit'
  proxy.$nextTick(() => {
    Object.assign(userForm, row, {
      role: `${row.roleId}/${row.roleName}`,
      dept: `${row.deptId}/${row.deptName}`
    }, { userEmail: row.userEmail.split('@')[0] })
  })
}
const handleLook = (row) => {
  dialogVisable.value = true
  action.value = 'look'
  proxy.$nextTick(() => {
    Object.assign(userForm, row, {
      role: `${row.roleId}/${row.roleName}`,
      dept: `${row.deptId}/${row.deptName}`
    }, { userEmail: row.userEmail.split('@')[0] })
  })
}
const handleCancel = () => {
  dialogVisable.value = false
  proxy.$refs.createRef.resetFields()
}
const getRoleList = async () => {
  try {
    let list = await proxy.$api.getRoleAllList()
    roleList.value = list
  } catch (err) {
    throw new Error(err)
  }
}
const getDeptList = async () => {
  try {
    let list = await proxy.$api.getDeptAllList()
    deptList.value = list
  } catch (err) {
    throw new Error(err)
  }
}
const handleSelectRole = (val) => {
  const [roleId, roleName] = val.split('/')
  Object.assign(userForm, { roleId, roleName })
}
const handleSelectDept = (val) => {
  const [deptId, deptName] = val.split('/')
  Object.assign(userForm, { deptId, deptName })
}
onMounted(() => {
  getRoleList()
  getDeptList()
  getUserList()

})
</script>
<template>
  <div class="user-manage">
    <div class="query-form">
      <el-form
        inline
        :model="searchUser"
        ref="form"
      >
        <el-form-item
          label="用户ID"
          prop="userId"
        >
          <el-input
            v-model="searchUser.userId"
            placeholder="请输入用户ID"
          />
        </el-form-item>
        <el-form-item
          label="用户名"
          prop="userName"
        >
          <el-input
            v-model="searchUser.userName"
            placeholder="请输入用户名称"
          />
        </el-form-item>
        <el-form-item
          label="用户状态"
          prop="state"
        >
          <el-select
            v-model="searchUser.state"
            style="width: 160px"
          >
            <el-option
              label="所有"
              :value="0"
            ></el-option>
            <el-option
              label="在职"
              :value="1"
            ></el-option>
            <el-option
              label="离职"
              :value="2"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="handleQuery"
          >查询</el-button>
          <el-button @click="handleReset(form)">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="base-table">
      <div class="action">
        <el-button
          type="primary"
          @click="dialogVisable=true;action='create'"
          v-has="'user-add'"
        >新增</el-button>
        <el-button
          type="danger"
          @click="handlePatchDel"
          v-has="'user-patch-del'"
        >批量删除</el-button>
      </div>

      <el-table
        :data="userList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column
          v-for="(item,index) in columns"
          :key="item.prop"
          :prop="item.prop"
          :label="item.label"
          :formatter="item.formatter"
        />
        <el-table-column
          fixed="right"
          label="操作"
          width="190"
        >
          <template #default="scope">
            <el-button
              size="small"
              @click="handleEdit(scope.row)"
              v-has="'user-edit'"
            >编辑</el-button>
            <el-button
              type="primary"
              size="small"
              @click="handleLook(scope.row)"
              v-has="'user-query'"
            >查看</el-button>

            <el-popconfirm
              title="确定要删除该用户吗?"
              @confirm="handleDel(scope.row)"
            >
              <template #reference>
                <el-button
                  type="danger"
                  size="small"
                  v-has="'user-del'"
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
      :title="action==='create'?'新增用户':action==='edit'?'编辑用户':'查看详情'"
      width="600"
    >
      <el-form
        :model="userForm"
        label-width="100"
        style="margin:30px 0"
        :rules="createRules"
        ref="createRef"
      >
        <el-form-item
          label="用户名"
          prop="userName"
        >
          <el-input
            placeholder="请输入用户名"
            v-model="userForm.userName"
            :disabled="action==='edit'||action==='look'"
          />
        </el-form-item>
        <el-form-item
          label="用户邮箱"
          prop="userEmail"
        >
          <el-input
            placeholder="请输入用户邮箱"
            v-model="userForm.userEmail"
            :disabled="action==='edit'||action==='look'"
          >
            <template #append>@fire.com</template></el-input>
        </el-form-item>
        <el-form-item
          label="手机号"
          prop="mobile"
        >
          <el-input
            placeholder="请输入手机号"
            v-model="userForm.mobile"
            :disabled="action==='look'"
          />
        </el-form-item>
        <el-form-item
          label="性别"
          prop="sex"
        >
          <el-radio-group
            v-model="userForm.sex"
            :disabled="action==='look'"
          >
            <el-radio
              label="男"
              :value="0"
            ></el-radio>
            <el-radio
              label="女"
              :value="1"
            ></el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="状态"
          prop="state"
        >
          <el-select
            v-model="userForm.state"
            :disabled="action==='look'"
          >
            <el-option
              :value="1"
              label="在职"
            ></el-option>
            <el-option
              :value="2"
              label="离职"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          prop="role"
          label="系统角色"
        >
          <el-select
            v-model="userForm.role"
            placeholder="请选择系统角色"
            @change="handleSelectRole"
            :disabled="action==='look'"
          >
            <el-option
              v-for="role in roleList"
              :key="role._id"
              :label="role.roleName"
              :value="`${role._id}/${role.roleName}`"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          prop="deptId"
          label="所属部门"
        >
          <el-select
            v-model="userForm.dept"
            placeholder="请选择所属部门"
            @change="handleSelectDept"
            :disabled="action==='look'"
          >
            <el-option
              v-for="item in deptList"
              :key="item._id"
              :label="item.deptName"
              :value="`${item._id}/${item.deptName}`"
            ></el-option>
          </el-select>
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

<style lang="scss">
</style>
