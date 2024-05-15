<script setup>
import { column } from 'element-plus/es/components/table-v2/src/common';
import { onMounted, reactive, ref } from 'vue';
import { getCurrentInstance } from 'vue';
import { useUserStore } from '../store';
const { proxy } = getCurrentInstance()

const queryForm = ref({})
const dialogVisable = ref(false)
const permissionDialog = ref(false)
const curRoleName = ref()
const curRoleId = ref()
const permissionMap = ref({})
const action = ref()
const roleList = ref([])
const userStore = useUserStore()
const columns = [
  {
    prop: 'roleName',
    label: '角色名称'
  },
  {
    prop: 'remark',
    label: '备注'
  },
  {
    prop: 'permissionList',
    label: '权限列表',
    formatter: (row, column, value) => {
      let names = []
      let list = value.halfCheckedKeys || []
      list.map((key) => {
        let name = permissionMap.value[key]
        if (key && name) {
          names.push(name)
        }
      })
      return names.join(",")
    }

  },
  {
    prop: 'createTime',
    label: '创建时间',
    formatter (row, column, value) {
      let date = new Date(value)
      return date.toLocaleDateString()
    }
  }
]
const roleForm = reactive({})
const menuList = ref([])
const rules = reactive({
  roleName: [
    {
      required: true,
      message: '请输入用户名称',
      trigger: 'blur'
    }
  ]
})
// 角色列表
const getRoleList = async () => {
  try {
    let list = await proxy.$api.getRoleList(queryForm)
    roleList.value = list
  } catch (err) {
    throw new Error(err)
  }
}
// 查询
const handleQuery = () => {
  getRoleList()
}
// 重置查询表单
const handleReset = () => {
  proxy.$refs.form.resetFields()
}
// 编辑角色
const handleEdit = async (row) => {
  dialogVisable.value = true
  action.value = 'edit'
  // 在dom更新完的下一阶段
  proxy.$nextTick(() => {
    Object.assign(roleForm, row)
  })
}
// 删除角色
const handleDel = async (row) => {
  action.value = 'delete'
  try {
    await proxy.$api.roleSubmit({ _id: row._id, action: action.value })
    getRoleList()
    proxy.$message.success('删除成功')
  } catch (err) {
    proxy.$message.error('删除失败')
    throw new Error(err)
  }

}
// 编辑权限
const handlePermission = (row) => {
  action.value = 'set'
  permissionDialog.value = true
  curRoleName.value = row.roleName
  curRoleId.value = row._id
  let { checkedKeys } = row.permissionList
  setTimeout(() => {
    proxy.$refs.permisssionTree.setCheckedKeys(checkedKeys)
  })
}
const handleLook = (row) => {
  permissionDialog.value = true
  action.value = 'look'
  curRoleName.value = row.roleName
  curRoleId.value = row._id
  let { checkedKeys } = row.permissionList
  setTimeout(() => {
    proxy.$refs.permisssionTree.setCheckedKeys(checkedKeys)
  })
}
const handlePermissionSubmit = async () => {
  permissionDialog.value = false

  let nodes = proxy.$refs.permisssionTree.getCheckedNodes()
  let halfKeys = proxy.$refs.permisssionTree.getHalfCheckedKeys()
  let checkedKeys = []
  let parentKeys = []
  nodes.map((node) => {
    if (!node.children) {
      checkedKeys.push(node._id)
    } else {
      parentKeys.push(node._id)
    }
  })

  let params = {
    _id: curRoleId.value,
    permissionList: {
      checkedKeys,
      halfCheckedKeys: parentKeys.concat(halfKeys)
    }
  }
  try {
    await proxy.$api.updatePermission(params)
    permissionDialog.value = false
    proxy.$message.success('设置成功')
    getRoleList()
    getPermissionList()

  } catch (err) {
    proxy.$message.error('设置失败')
    throw new Error(err)
  }
}
const getPermissionList = async () => {
  try {
    const list = await proxy.$api.getPermissionList()
    userStore.saveMenuList(list.menuList)
    userStore.saveActionList(list.actionList)
  } catch (error) {
    console.error(error)
  }
}
// dialog取消
const handleCancel = () => {
  dialogVisable.value = false
  proxy.$refs.roleRef.resetFields()
}
// dialog提交
const handleSubmit = async () => {

  proxy.$refs.roleRef.validate(async (valid) => {
    if (valid) {
      let params = { ...roleForm, action: action.value }
      try {
        let info = action.value === 'create' ? '创建成功' : '编辑成功'
        await proxy.$api.roleSubmit(params)
        dialogVisable.value = false
        proxy.$message.success(info)
        getRoleList()
        proxy.$refs.roleRef.resetFields()
      } catch (err) {
        proxy.$message.error('创建失败')
        throw new Error(err)
      }
    }
  })
}

// 获取菜单列表
const getMenuList = async () => {
  try {
    const list = await proxy.$api.getMenuList()
    menuList.value = list
    getActionMap(list)
  } catch (e) {
    throw new Error(e)
  }
}
// 获取权限列表
const getActionMap = (list) => {
  let actionMap = {}
  const deep = (arr) => {
    while (arr.length) {
      let item = arr.pop()
      if (item.children && item.action) {
        actionMap[item._id] = item.menuName
      }
      if (item.children && !item.action) {
        deep(item.children)
      }
    }
  }
  deep(JSON.parse(JSON.stringify(list)))
  Object.assign(permissionMap.value, actionMap)
}
onMounted(() => {
  getRoleList()
  getMenuList()
})
</script>

<template>
  <div class="menu-manage">
    <div class="query-form">
      <el-form
        inline
        :model="queryForm"
        ref="form"
      >
        <el-form-item
          label="角色名称"
          prop="roleName"
        >
          <el-input
            v-model="queryForm.roleName"
            placeholder="请输入角色名称"
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
          v-has="'role-add'"
        >创建</el-button>
      </div>

      <el-table
        :data="roleList"
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
          width="300"
        >
          <template #default="scope">

            <el-button
              size="small"
              @click="handleEdit(scope.row)"
              v-has="'role-edit'"
            >编辑</el-button>
            <el-button
              size="small"
              type="primary"
              @click="handleLook(scope.row)"
              v-has="'role-look-permission'"
            >查看权限</el-button>
            <el-button
              size="small"
              @click="handlePermission(scope.row)"
              v-has="'role-set-permission'"
            >设置权限</el-button>

            <el-popconfirm
              title="确定要删除该角色吗?"
              @confirm="handleDel(scope.row)"
            >
              <template #reference>
                <el-button
                  type="danger"
                  size="small"
                  v-has="'role-del'"
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
      :title="action==='create'?'创建角色':'编辑角色'"
      width="600"
    >
      <el-form
        :model="roleForm"
        label-width="100"
        style="margin:30px 0"
        :rules="rules"
        ref="roleRef"
      >
        <el-form-item
          label="角色名称"
          prop="roleName"
        >
          <el-input
            placeholder="请输入角色名称"
            v-model="roleForm.roleName"
            :disabled="action==='edit'"
          />
        </el-form-item>
        <el-form-item
          label="备注"
          prop="remark"
        >
          <el-input
            v-model="roleForm.remark"
            placeholder="请输入角色备注信息"
            type="textarea"
            :row="2"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button
            type="primary"
            @click="handleSubmit"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="permissionDialog"
      align-center
      :title="action==='look'?'查看权限':'权限设置'"
      width="600"
    >
      <el-form
        label-width="100"
        style="margin:30px 0"
      >
        <el-form-item label="角色名称：">
          {{ curRoleName }}
        </el-form-item>
        <el-form-item :label="action==='look'?'权限详情：':'选择权限：'">
          <el-tree
            ref="permisssionTree"
            :data="menuList"
            show-checkbox
            node-key="_id"
            :props="{label:'menuName'}"
            default-expand-all
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="permissionDialog=false">{{action==='look'?'关闭':'取消'}}</el-button>
          <el-button
            type="primary"
            @click="handlePermissionSubmit"
            v-if="action!=='look'"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>