<script setup>
import { getCurrentInstance, onMounted, reactive, ref, toRaw } from 'vue';
const { proxy } = getCurrentInstance()
const queryForm = reactive({
  materialType: 0
})
const materialList = ref([])
const columns = [
  {
    prop: 'materialId',
    label: '物资编号'
  },
  {
    prop: 'materialName',
    label: '物资名称'
  },
  {
    prop: 'materialType',
    label: '物资类型',
    formatter (row, column, value) {
      return {
        1: '设备及其零部件',
        2: '燃料',
        3: '安全防护用品',
        4: '其他'
      }[value]
    }
  },
  {
    prop: 'specification',
    label: '规格'
  },
  {
    prop: 'model',
    label: '型号'
  },
  {
    prop: 'safeStack',
    label: '安全库存量',
    formatter (row, column, value) {
      return `${value} ${row.unit}`
    }
  }
]
const createRules = reactive({
  materialId: [
    {
      required: true,
      message: '请输入物资编号',
      trigger: 'blur'
    }
  ],
  materialName: [
    {
      required: true,
      message: '请输入物资名称',
      trigger: 'blur'
    }
  ],
  materialType: [
    {
      required: true,
      message: '请选择物资类型',
      trigger: 'blur'
    }
  ],
  unit: [
    {
      required: true,
      message: '请输入计量单位',
      trigger: 'blur'
    }
  ],
  safeStack: [
    {
      required: true,
      message: '请设置安全库存量',
      trigger: 'blur'
    }
  ]
})
const pager = reactive({
  pageSize: 8,
  pageNum: 1
})
const materialForm = reactive({})
const dialogVisable = ref(false)
const action = ref()
const checkedMaterialIds = ref([])
// 分页处理
const handleCurrentChange = (val) => {
  pager.pageNum = val
  getMaterialList()
}
// 操作——查询
const handleQuery = () => {
  getMaterialList()
}
// 重置
const handleReset = () => {
  proxy.$refs.form.resetFields()
}

// 选择物资对象
const handleSelectionChange = (list) => {
  let arr = []
  list.forEach(element => {
    arr.push(element.materialId)
  });
  checkedMaterialIds.value = arr
}
// 操作——删除单个物资
const handleDel = async (row) => {
  try {
    await proxy.$api.deleteMaterial({
      materialIds: [row.materialId]
    })
    // console.log(row.userId)
    proxy.$message.success('删除成功')
    getMaterialList()
  } catch (err) {
    proxy.$message.error('删除失败')
  }
}
// 操作——批量删除
const handlePatchDel = async () => {
  try {
    if (checkedMaterialIds.value.length === 0) {
      proxy.$message.error('请选择要删除的用户')
      return
    }
    const res = await proxy.$api.deleteMaterial({
      materialIds: checkedMaterialIds.value
    })
    if (res.deletedCount > 0) {
      proxy.$message.success('删除成功')
      getMaterialList()
    } else {
      proxy.$message.error('删除失败')
    }
  } catch (err) {
    proxy.$message.error('删除失败')
  }

}
// 编辑
const handleEdit = async (row) => {
  dialogVisable.value = true
  action.value = 'edit'
  proxy.$nextTick(() => {
    Object.assign(materialForm, row)
  })
  console.log(row);
}
// 查看
const handleLook = async (row) => {
  dialogVisable.value = true
  action.value = 'look'
  proxy.$nextTick(() => {
    Object.assign(materialForm, row)
  })
}
// 操作——确认提交(创建和编辑)
const handleSubmit = () => {
  proxy.$refs.createRef.validate(async (valid) => {
    if (valid) {
      try {
        let info = action.value === 'create' ? '创建成功' : '编辑成功'
        let params = { action: action.value, ...materialForm }
        await proxy.$api.materialSubmit(params)
        dialogVisable.value = false
        proxy.$message.success(info)
        getMaterialList()
        proxy.$refs.createRef.resetFields()
      } catch (err) {
        proxy.$message.error('创建失败')
        throw new Error(err)
      }
    }
  })
}
// 操作——取消
const handleCancel = () => {
  dialogVisable.value = false
  proxy.$refs.createRef.resetFields()
}

// 获取物资列表
const getMaterialList = async () => {
  try {
    let parmas = { ...queryForm, ...pager }
    const { list, page } = await proxy.$api.getMaterialList(parmas)
    materialList.value = list
    pager.total = page.total
  } catch (err) {
    throw new Error(err)
  }
}
onMounted(() => {
  getMaterialList()
})
</script>
<template>
  <div class="mater-manage">
    <div class="query-form">
      <el-form
        inline
        :model="queryForm"
        ref="form"
      >
        <el-form-item
          label="物资编号"
          prop="materialId"
        >
          <el-input
            v-model="queryForm.materialId"
            placeholder="请输入物资编号"
            style="width:180px"
          />
        </el-form-item>
        <el-form-item
          label="物资名称"
          prop="materialName"
        >
          <el-input
            v-model="queryForm.materialName"
            placeholder="请输入物资名称"
            style="width:180px"
          />
        </el-form-item>
        <el-form-item
          label="物资类型"
          prop="materialType"
        >
          <el-select
            v-model="queryForm.materialType"
            style="width: 160px"
          >
            <el-option
              label="所有"
              :value="0"
            ></el-option>
            <el-option
              label="设备及其零部件"
              :value="1"
            ></el-option>
            <el-option
              label="燃料"
              :value="2"
            ></el-option>
            <el-option
              label="安全防护用品"
              :value="3"
            ></el-option>
            <el-option
              label="其他"
              :value="4"
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
        >新增</el-button>
        <el-button
          type="danger"
          @click="handlePatchDel"
        >批量删除</el-button>
      </div>

      <el-table
        :data="materialList"
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
              title="确定要删除该物资吗?"
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
      :title="action==='create'?'新增物资':action==='edit'?'编辑物资':'查看详情'"
      width="600"
    >
      <el-form
        :model="materialForm"
        label-width="100"
        style="margin:30px 0"
        :rules="createRules"
        ref="createRef"
      >
        <el-form-item
          label="物资编号"
          prop="materialId"
        >
          <el-input
            placeholder="请输入物资编号"
            v-model="materialForm.materialId"
            :disabled="action==='edit'||action==='look'"
          />
        </el-form-item>
        <el-form-item
          label="物资名称"
          prop="materialName"
        >
          <el-input
            placeholder="请输入物资名称"
            v-model="materialForm.materialName"
            :disabled="action==='edit'||action==='look'"
          />
        </el-form-item>
        <el-form-item
          label="物资类型"
          prop="materialType"
        >
          <el-select
            v-model="materialForm.materialType"
            style="width: 200px"
            placeholder="请选择物资类型"
            :disabled="action==='look'"
          >
            <el-option
              label="设备及其零部件"
              :value="1"
            ></el-option>
            <el-option
              label="燃料"
              :value="2"
            ></el-option>
            <el-option
              label="安全防护用品"
              :value="3"
            ></el-option>
            <el-option
              label="其他"
              :value="4"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="计量单位"
          prop="unit"
        >
          <el-input
            placeholder="请输入计量单位"
            v-model="materialForm.unit"
            :disabled="action==='look'"
          />
        </el-form-item>
        <el-form-item
          label="规格"
          prop="specification"
        >
          <el-input
            placeholder="请输入规格"
            v-model="materialForm.specification"
            :disabled="action==='look'"
          />
        </el-form-item>
        <el-form-item
          label="型号"
          prop="model"
        >
          <el-input
            placeholder="请输入型号"
            v-model="materialForm.model"
            :disabled="action==='look'"
          />
        </el-form-item>
        <el-form-item
          label="安全库存量"
          prop="safeStack"
        >
          <el-input-number
            :min="0"
            v-model="materialForm.safeStack"
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