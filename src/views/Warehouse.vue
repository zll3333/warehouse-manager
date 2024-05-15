<script setup>
import { getCurrentInstance, onMounted, reactive, ref } from 'vue'
import InboundReq from './InboundReq.vue';
const { proxy } = getCurrentInstance()
const queryForm = reactive({
  warehouseType: 0
})
const warehouseList = ref([])
const columns = [
  {
    prop: 'warehouseId',
    label: '仓库编号'
  },
  {
    prop: 'warehouseName',
    label: '仓库名称'
  },
  {
    prop: 'warehouseType',
    label: '仓库类型',
    formatter (row, column, value) {
      return {
        1: '设备仓',
        2: '燃料舱',
        3: '综合仓'
      }[value]
    }
  },
  {
    prop: 'address',
    label: '仓库地址'
  },
  {
    prop: 'capacity',
    label: '仓库总容量'
  },
  // {
  //   prop: 'remainCapacity',
  //   label: '仓库剩余容量'
  // },
  {
    prop: 'userName',
    label: '仓库负责人'
  },
]
const dialogVisable = ref(false)
const action = ref()
const type = ref('仓库')
const warehouseForm = reactive({
  parentId: [null],
})
const warehouseRules = {
  warehouseId: [
    {
      required: true,
      message: `请输入${type.value}编号`,
      trigger: 'blur'
    }
  ],
  warehouseName: [
    {
      required: true,
      message: `请输入${type.value}名称`,
      trigger: 'blur'
    }
  ],
  leader: [
    {
      required: true,
      message: '请选择仓库负责人',
      trigger: 'blur'
    }
  ]
}
const roleId = ref()
const leaders = ref([])
const pager = ref({
  pageSize: 10,
  pageNum: 1
})
// 分页处理
const handleCurrentChange = (val) => {
  pager.pageNum = val
  getWarehouseList()
}

// 操作——查询
const handleQuery = () => {
  getWarehouseList()
}

// 操作——重置表单
const handleReset = () => {
  proxy.$refs.form.resetFields()
  getWarehouseList()
}
const getUserList = async () => {
  try {
    let { list } = await proxy.$api.getUserList()
    // userList.value = list
    await getRoleInfo()
    let arr = list.filter(item => item.roleId === roleId.value)
    leaders.value = arr
  } catch (error) {
    throw new Error(error)
  }
}
// 操作——新增
const handleAdd = (row) => {
  type.value = '库位'
  dialogVisable.value = true
  action.value = 'create'
  proxy.$nextTick(() => {
    Object.assign(warehouseForm, {
      leader: `${row.userId}/${row.userName}/${row.mobile}`,
      mobile: row.mobile,
      warehouseType: row.warehouseType,
      address: row.address,
      userName: row.userName,
      userId: row.userId
    })
  })
  warehouseForm.state = 2
  warehouseForm.parentId = [...row.parentId, row._id].filter(item => item)
}
// 操作——编辑
const handleEdit = (row) => {
  dialogVisable.value = true
  action.value = 'edit'
  proxy.$nextTick(() => {
    Object.assign(warehouseForm, row, {
      leader: `${row.userId}/${row.userName}/${row.mobile}`
    })
  })
  if (row.state === 2) {
    type.value = '库位'
  } else {
    type.value = '仓库'
  }
}
// 操作——查看
const handleLook = (row) => {
  dialogVisable.value = true
  action.value = 'look'
  proxy.$nextTick(() => {
    Object.assign(warehouseForm, row, {
      leader: `${row.userId}/${row.userName}/${row.mobile}`
    })
  })
  if (row.state === 2) {
    type.value = '库位'
  } else {
    type.value = '仓库'
  }
}
// 操作——删除
const handleDel = async (row) => {
  action.value = 'delete'
  try {
    await proxy.$api.warehouseSubmit({ _id: row._id, action: action.value, parentId: row.parentId, capacity: row.capacity })
    getWarehouseList()
    proxy.$message.success('删除成功')
  } catch (err) {
    proxy.$message.error('删除失败')
  }
}
// 操作——提交
const handleSubmit = () => {
  proxy.$refs.warehouseRef.validate(async (valid) => {
    if (valid) {
      try {
        let info = action.value === 'create' ? '创建成功' : '编辑成功'
        let params = { ...warehouseForm, action: action.value }
        await proxy.$api.warehouseSubmit(params)
        dialogVisable.value = false
        proxy.$message.success(info)
        getWarehouseList()
        proxy.$refs.warehouseRef.resetFields()

      } catch (err) {
        // proxy.$message.error('....')
      }
    }
  })
}
// 操作——取消
const handleCancel = () => {
  dialogVisable.value = false
  proxy.$refs.warehouseRef.resetFields()
}


// 获取仓库管理员角色Id
const getRoleInfo = async () => {
  try {
    let list = await proxy.$api.getRoleAllList()
    list.map(item => {
      if (item.roleName === '仓库管理员') {
        roleId.value = item._id
      }

    })
  } catch (error) {
    throw new Error(error)
  }
}
const handleSelect = (val) => {
  if (val) {
    const [userId, userName, mobile] = val.split('/')
    Object.assign(warehouseForm, { userId, userName, mobile })
  }
}
const getWarehouseList = async () => {
  try {
    let parmas = { ...queryForm, ...pager }
    let { list, page } = await proxy.$api.getWarehouseList(parmas)
    console.log(list[0].children);
    warehouseList.value = list
    pager.total = page.total
    // console.log(warehouseList.value[0].children);
  } catch (error) {
    throw new Error(error)
  }
}
onMounted(() => {
  getUserList()
  getWarehouseList()
})
</script>
<template>
  <div class="warehouse-manage">
    <div class="query-form">
      <el-form
        inline
        :model="queryForm"
        ref="form"
      >
        <el-form-item
          label="仓库编号"
          prop="warehouseId"
        >
          <el-input
            v-model="queryForm.warehouseId"
            placeholder="请输入仓库编号"
            style="width:180px"
          />
        </el-form-item>
        <el-form-item
          label="仓库名称"
          prop="warehouseName"
        >
          <el-input
            v-model="queryForm.warehouseName"
            placeholder="请输入仓库名称"
            style="width:180px"
          />
        </el-form-item>
        <el-form-item
          label="仓库类型"
          prop="warehouseType"
        >
          <el-select
            v-model="queryForm.warehouseType"
            style="width: 160px"
          >
            <el-option
              label="所有"
              :value="0"
            ></el-option>
            <el-option
              label="设备仓"
              :value="1"
            ></el-option>
            <el-option
              label="燃料仓"
              :value="2"
            ></el-option>
            <el-option
              label="综合仓"
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
          @click="dialogVisable=true;action='create';warehouseForm.state=1;type='仓库'"
        >创建</el-button>
      </div>
      <el-table
        :data="warehouseList"
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
          width="250"
        >
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="handleAdd(scope.row)"
              v-if="scope.row.state===1"
            >新增</el-button>
            <!-- <el-button
              size="small"
              @click="handleEdit(scope.row)"
            >编辑</el-button> -->
            <el-button
              size="small"
              @click="handleLook(scope.row)"
            >详情</el-button>
            <el-popconfirm
              title="确定要删除该仓库吗?"
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
      :title="action==='create'?'创建'+type:action==='edit'?'编辑'+type:type+'详情'"
      width="600"
    >
      <el-form
        :model="warehouseForm"
        label-width="100"
        style="margin:30px 0"
        :rules="warehouseRules"
        ref="warehouseRef"
      >
        <el-form-item
          :label="type+'编号'"
          prop="warehouseId"
        >
          <el-input
            :placeholder="'请输入'+type+'编号'"
            v-model="warehouseForm.warehouseId"
            :disabled="action==='look'||action==='edit'"
          />
        </el-form-item>
        <el-form-item
          :label="type+'名称'"
          prop="warehouseName"
        >
          <el-input
            :placeholder="'请输入'+type+'名称'"
            v-model="warehouseForm.warehouseName"
            :disabled="action==='look'||action==='edit'"
          />
        </el-form-item>
        <el-form-item
          label="仓库类型"
          prop="warehouseType"
          v-if="warehouseForm.state===1"
        >
          <el-select
            v-model="warehouseForm.warehouseType"
            style="width: 200px"
            placeholder="请输入仓库类型"
          >
            <el-option
              label="设备仓"
              :value="1"
            ></el-option>
            <el-option
              label="燃料仓"
              :value="2"
            ></el-option>
            <el-option
              label="综合仓"
              :value="3"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="仓库地址"
          prop="address"
          v-if="warehouseForm.state===1"
        >
          <el-input
            placeholder="请输入仓库地址"
            v-model="warehouseForm.address"
            :disabled="action==='look'"
          />
        </el-form-item>
        <el-form-item
          :label="type+'容量'"
          prop="capacity"
          v-if="warehouseForm.state===2"
        >
          <el-input-number
            v-model="warehouseForm.capacity"
            :disabled="action==='look'||warehouseForm.state===1"
          />
        </el-form-item>
        <el-form-item
          label="仓库负责人"
          prop="leader"
        >
          <el-select
            placeholder="请选择负责人"
            v-model="warehouseForm.leader"
            style="width: 200px"
            @change="handleSelect"
            :disabled="action==='look'||warehouseForm.state===2"
          >
            <el-option
              v-for="item in leaders"
              :key="item.userId"
              :label="item.userName"
              :value="`${item.userId}/${item.userName}/${item.mobile}`"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="负责人电话"
          prop="mobile"
        >
          <el-input
            v-model="warehouseForm.mobile"
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
  </div>
</template>