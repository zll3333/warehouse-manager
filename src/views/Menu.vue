<script setup>
import { onMounted, reactive, ref } from 'vue';
import { getCurrentInstance } from 'vue';
import { useUserStore } from '../store';
const { proxy } = getCurrentInstance()
const searchMenu = reactive({
  state: 1
})
const userStore = useUserStore()
const menuList = ref([])
const menuRules = reactive({
  menuName: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' }
  ]
})
// 初始化表格列
const columns = [
  {
    prop: 'menuName',
    label: '菜单名称',
    width: 150
  },
  {
    prop: 'icon',
    label: '菜单图标'
  },
  {
    prop: 'menuType',
    label: '菜单类型',
    formatter (row, column, value) {
      return {
        1: '菜单',
        2: '按钮',
      }[value]
    }
  },
  {
    prop: 'menuCode',
    label: '权限标识',
    width: 140
  },
  {
    prop: 'path',
    label: '路由地址',
  },
  {
    prop: 'component',
    label: '组件路径',
    width: 130
  },
  {
    prop: 'state',
    label: '菜单状态',
    formatter (row, column, value) {
      return {
        1: '正常',
        2: '停用',
      }[value]
    }
  }
]
// 初始化创建菜单form
const menuForm = ref({
  parentId: [null],
  menuType: 1,
  state: 1
})
const action = ref("create")
const dialogVisable = ref(false)
// 获取菜单列表
const getMenuList = async () => {
  try {
    const list = await proxy.$api.getMenuList(searchMenu)
    menuList.value = list
  } catch (e) {
    throw new Error(e)
  }
}
// 查询,获取菜单列表
const handleQuery = () => {
  getMenuList()

}
// 重置菜单表单
function handleReset () {
  const formEl = proxy.$refs.form
  if (!formEl) return
  formEl.resetFields()
  // getUserList()
}

// 新增
const handleAdd = (row) => {
  dialogVisable.value = true
  action.value = 'create'
  menuForm.value.parentId = [...row.parentId, row._id].filter(item => item)

  // const ids = [...row.parentId, row._id]
  // console.log(ids);

}
//编辑
const handleEdit = (row) => {
  dialogVisable.value = true
  action.value = 'edit'
  // 在dom更新完的下一阶段
  proxy.$nextTick(() => {
    Object.assign(menuForm.value, row)
  })

}
const handleLook = (row) => {
  dialogVisable.value = true
  action.value = 'look'
  proxy.$nextTick(() => {
    Object.assign(menuForm.value, row)
  })
}
// 删除
const handleDel = async (row) => {
  try {
    await proxy.$api.menuSubmit({ _id: row._id, action: 'delete' })
    proxy.$message.success('删除成功')
    getMenuList()
  } catch (e) {
    proxy.$message.error(e)
  }
}
// 取消
const handleCancel = () => {
  dialogVisable.value = false
  proxy.$refs.createRef.resetFields()
}
// 确定创建
const handleSubmit = () => {
  // console.log(menuForm.value)
  proxy.$refs.createRef.validate(async (valid) => {
    if (valid) {
      let info = action.value === 'create' ? '创建成功' : '编辑成功'
      let params = { ...menuForm.value, action: action.value }
      console.log(params);
      let res = await proxy.$api.menuSubmit(params)
      dialogVisable.value = false
      proxy.$message.success(info)
      getMenuList()
      getPermissionList()
      proxy.$refs.createRef.resetFields()
    }
  })

}
const getPermissionList = async () => {
  try {
    const list = await proxy.$api.getPermissionList()
    // menuList.value = list.menuList
    // actionList.value = list.actionList
    userStore.saveMenuList(list.menuList)
    userStore.saveActionList(list.actionList)
    // proxy.$storage.setItem("saveUserMenu", list.menuList)
    // proxy.$storage.setItem("saveUserAction", list.actionList)
  } catch (error) {
    console.error(error)
  }

  // console.log(menuList.value);
}
onMounted(() => {
  getMenuList()
})
</script>
<template>
  <div class="menu-manage">
    <div class="query-form">
      <el-form
        inline
        :model="searchMenu"
        ref="form"
      >
        <el-form-item
          label="菜单名称"
          prop="menuName"
        >
          <el-input
            v-model="searchMenu.menuName"
            placeholder="请输入菜单名称"
          />
        </el-form-item>
        <el-form-item
          label="菜单状态状态"
          prop="state"
        >
          <el-select
            v-model="searchMenu.state"
            style="width: 160px"
          >
            <el-option
              label="正常"
              :value="1"
            ></el-option>
            <el-option
              label="禁用"
              :value="2"
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
          v-has="'menu-add'"
        >创建</el-button>
      </div>

      <el-table
        :data="menuList"
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
              type="primary"
              size="small"
              @click="handleAdd(scope.row)"
              v-has="'menu-add'"
            >新增</el-button>
            <el-button
              size="small"
              @click="handleEdit(scope.row)"
              v-has="'menu-edit'"
            >编辑</el-button>
            <el-button
              type="primary"
              size="small"
              @click="handleLook(scope.row)"
              v-has="'menu-query'"
            >
              详情
            </el-button>

            <el-popconfirm
              title="确定要删除该菜单吗?"
              @confirm="handleDel(scope.row)"
            >
              <template #reference>
                <el-button
                  type="danger"
                  size="small"
                  v-has="'menu-del'"
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
      :title="action==='create'?'创建菜单':action==='edit'?'编辑菜单':'菜单详情'"
      width="600"
    >
      <el-form
        :model="menuForm"
        label-width="100"
        style="margin:30px 0"
        :rules="menuRules"
        ref="createRef"
      >
        <el-form-item
          label="父级菜单"
          prop="parentId"
        >
          <el-space :size="15">
            <el-cascader
              v-model="menuForm.parentId"
              placeholder="请选择父级菜单"
              :options="menuList"
              :props="{ checkStrictly: true,value:'_id',label:'menuName'}"
              clearable
              style="width: 200px"
              :disabled="action==='look'"
            />

            <span>不选，则直接创建一级菜单</span>
          </el-space>
        </el-form-item>
        <el-form-item
          label="菜单类型"
          prop="menuType"
        >
          <el-radio-group
            v-model="menuForm.menuType"
            :disabled="action==='look'"
          >
            <el-radio :value="1">菜单</el-radio>
            <el-radio :value="2">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="菜单名称"
          prop="menuName"
        >
          <el-input
            placeholder="请输入菜单名称"
            v-model="menuForm.menuName"
            :disabled="action==='look'"
          />
        </el-form-item>
        <el-form-item
          label="权限标识"
          prop="menuCode"
          v-show="menuForm.menuType===2"
        >
          <el-input
            placeholder="请输入权限标识"
            v-model="menuForm.menuCode"
            :disabled="action==='look'"
          />
        </el-form-item>
        <el-form-item
          label="菜单图标"
          prop="icon"
          v-show="menuForm.menuType===1"
        >
          <el-input
            placeholder="请输入菜单图标"
            v-model="menuForm.icon"
            :disabled="action==='look'"
          />
        </el-form-item>
        <el-form-item
          label="路由地址"
          prop="path"
          v-show="menuForm.menuType===1"
        >
          <el-input
            placeholder="请输入路由地址"
            v-model="menuForm.path"
            :disabled="action==='look'"
          />
        </el-form-item>
        <el-form-item
          label="组件地址"
          prop="component"
          v-show="menuForm.menuType==1"
        >
          <el-input
            placeholder="请输入组件地址"
            v-model="menuForm.component"
            :disabled="action==='look'"
          />
        </el-form-item>
        <el-form-item
          label="菜单状态"
          prop="state"
        >
          <el-radio-group
            v-model="menuForm.state"
            :disabled="action==='look'"
          >
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="2">停用</el-radio>
          </el-radio-group>
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
  </div>
</template>