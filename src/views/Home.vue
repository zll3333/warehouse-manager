<script setup>

import { useRouter } from 'vue-router';
import { useUserStore } from '../store';
import * as echarts from 'echarts';
import { getCurrentInstance, onMounted, reactive, ref } from 'vue';
const { proxy } = getCurrentInstance()
const router = useRouter()
const goLogin = () => {
  router.push("/login")
}
const userStore = useUserStore()

const undoColumns = [
  {
    prop: 'actionName',
    label: '单据名称',
    formatter (row, column, value) {
      if (row.inboundId) {
        return '入库申请'
      } else {
        return '出库申请'
      }
    }
  },
  {
    prop: 'applicant',
    label: '申请人'
  },
  {
    prop: 'createTime',
    label: '申请时间',
    formatter (row, column, value) {
      let date = new Date(value)
      return proxy.$util.formatDateTime(date)
    },
  },
  {
    prop: 'remark',
    label: '备注',
    width: 220
  }
]
const doneColumns = [
  {
    prop: 'actionName',
    label: '单据名称',
    formatter (row, column, value) {
      if (row.inboundId) {
        return '入库申请'
      } else {
        return '出库申请'
      }
    }
  },
  {
    prop: 'applicant',
    label: '申请人'
  },
  {
    prop: 'createTime',
    label: '审批时间',
    formatter (row, column, value) {
      let date = new Date(value)
      return proxy.$util.formatDateTime(date)
    },
    width: 170
  },
  {
    prop: 'suggestion',
    label: '审批意见',
    width: 200
  },
  {
    prop: 'result',
    label: '审批结果',
    formatter (row, column, value) {
      if (row.state === 3) {
        return '审批不通过'
      } else if (row.state === 2) {
        return '审批通过'
      }
    }
  }
]
const undoList = ref([])
const doneList = ref([])
const undoPager = reactive({
  pageSize: 5,
  pageNum: 1
})
const donePager = reactive({
  pageSize: 5,
  pageNum: 1
})
const activeName = ref("myundo")
const handleCurrentChange = (val) => {
  undoPager.pageNum = val
  // 获取列表
  getMyundoList()
}
const handleCurrentChange1 = (val) => {
  donePager.pageNum = val
  // 获取列表
  getMydoneList()
}
const columns = [
  {
    prop: 'type',
    label: '类别',
    width: 160
  },
  {
    prop: 'material',
    label: '物资',
    formatter (row, column, value) {
      return value.join("、")
    }
  }
]
const product = ref([])
const getBarTitleAndData = async () => {
  // 获取饼状图副title
  const { warehouseList, stackInfo } = await proxy.$api.getWarehouseStack()
  const title = warehouseList.map((item, index) => {
    return {
      subtext: item,
      left: (1 / (warehouseList.length * 2)) * (2 * index + 1) * 100 + '%',
      top: '85%',
      textAlign: 'center'
    }
  })
  const series = []
  const keys = Object.keys(stackInfo)
  for (let key in stackInfo) {
    let data = []
    for (let iKey in stackInfo[key]) {
      data.push({
        name: iKey,
        value: stackInfo[key][iKey]
      })
    }
    series.push({
      type: 'pie',
      radius: '50%',
      center: ['50%', '50%'],
      data,
      label: {
        position: 'outer',
        alignTo: 'labelLine',
        bleedMargin: 5
      },
      left: (1 / keys.length) * (keys.indexOf(key)) * 100 + '%',
      right: (1 / keys.length) * (keys.length - 1 - keys.indexOf(key)) * 100 + '%',
      top: 0,
      bottom: 0
    })
  }
  /**
   * {
        type: 'pie',
        radius: '25%',
        center: ['50%', '50%'],
        data: data,
        label: {
          position: 'outer',
          alignTo: 'labelLine',
          bleedMargin: 5
        },
        left: '33.3333%',//
        right: '33.3333%',//
        top: 0,
        bottom: 0
      },                                      
   */

  return { title, series }

}
// 获取各仓库物资占比情况
const initBarChart = async () => {
  let barChart = echarts.init(proxy.$refs.barChartRef);
  const { title, series } = await getBarTitleAndData()
  let option = {
    title: [
      {
        text: '各仓库物资存储情况',
        left: 'center'
      },
      ...title
    ],
    tooltip: {
      trigger: 'item'
    },
    series,
  };
  barChart.setOption(option)
}
// 物资类别占比图
const initProductBarChart = async () => {
  let barChart = echarts.init(proxy.$refs.productBarChart);
  const typeObj = await proxy.$api.getProductType()
  let data = []
  for (let key in typeObj) {
    data.push({
      name: key,
      value: typeObj[key].length
    })
  }
  let option = {
    title: {
      text: '物资类别占比情况',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 20,
      top: '20%'
    },

    series: [
      {
        type: 'pie',
        radius: '60%',
        center: ['60%', '50%'],
        data,
        left: 'center',
        top: 0,
        bottom: 0,
        labelLine: {
          show: false
        },
        label: {
          show: false,
          position: 'center'
        },
      }
    ]
  }
  barChart.setOption(option)
}

// 获取代办列表
const getMyundoList = async () => {
  try {
    const resList = await proxy.$api.getMyundoData({ userName: userStore.userInfo.userName, ...undoPager })
    const { list, total } = proxy.$util.paginate(resList, undoPager.pageSize, undoPager.pageNum)
    undoList.value = list
    undoPager.total = total
  } catch (error) {
    throw new Error(error.stack)
  }
}
const getMydoneList = async () => {
  try {
    const resList = await proxy.$api.getMydoneData({ userName: userStore.userInfo.userName, ...donePager })
    const { list, total } = proxy.$util.paginate(resList, donePager.pageSize, donePager.pageNum)
    doneList.value = list
    donePager.total = total
  } catch (error) {
    throw new Error(error.stack)
  }
}
const getProductType = async () => {
  try {
    let res = await proxy.$api.getProductType()
    let productList = []
    for (const key in res) {
      productList.push({
        type: key,
        material: res[key]
      })
    }
    product.value = productList
  } catch (error) {
    throw new Error(error)
  }
}
onMounted(() => {

  getMyundoList()
  getMydoneList()
  initBarChart()
  getBarTitleAndData()
  initProductBarChart()
  getProductType()
})
</script>
<template>
  <div class="home-wrapper">
    <div class="workboard">
      <div
        class="tab"
        style="width:70%"
      >
        <el-tabs
          v-model="activeName"
          type="card"
          class="myTabs"
        >
          <el-tab-pane
            label="我的待办"
            name="myundo"
            class="myundo"
          >
            <el-table
              :data="undoList"
              row-key="_id"
              border
            >
              <el-table-column
                v-for="(item,index) in undoColumns"
                :key="item.prop+index"
                :prop="item.prop"
                :label="item.label"
                :formatter="item.formatter"
                :width="item.width"
              />
            </el-table>
            <el-pagination
              class="pagination"
              layout="prev, pager, next"
              :total="undoPager.total"
              :page-size="undoPager.pageSize"
              @current-change="handleCurrentChange"
              background
              hide-on-single-page
            />
          </el-tab-pane>
          <el-tab-pane
            label="我的已办"
            name="mydone"
            class="mydone"
          >
            <el-table
              :data="doneList"
              row-key="_id"
              border
            >
              <el-table-column
                v-for="(item,index) in doneColumns"
                :key="item.prop+index"
                :prop="item.prop"
                :label="item.label"
                :formatter="item.formatter"
                :width="item.width"
              />
            </el-table>
            <el-pagination
              class="pagination"
              layout="prev, pager, next"
              :total="donePager.total"
              :page-size="donePager.pageSize"
              @current-change="handleCurrentChange1"
              background
              hide-on-single-page
            />
          </el-tab-pane>
        </el-tabs>

      </div>
      <div
        class="detail"
        style="width:30%"
      >
        <div class="datetime">2024-5-13</div>
        <div class="doTotal">
          <div class="undo">
            <span>待审批数量</span>
            <span>{{ undoList.length }}</span>
          </div>
          <div class="hasdo">
            <span>已审批数量</span>
            <span>{{ doneList.length }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="statistics">
      <div class="title">仓储管理数据可视化看板</div>
      <div class="dashboard">
        <div
          class="barChart"
          ref="barChartRef"
          style="width: 100%;height:300px"
        ></div>
        <div class="product">
          <div
            class="productBarChart"
            ref="productBarChart"
            style="width:50%;height:300px;margin-top: 20px;"
          ></div>
          <div
            class="product-detail"
            style="width:50%"
          >
            <el-table
              :data="product"
              row-key="_id"
              border
            >
              <el-table-column
                v-for="(item,index) in columns"
                :key="item.prop+index"
                :prop="item.prop"
                :label="item.label"
                :formatter="item.formatter"
                :width="item.width"
              />
            </el-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
:deep(.el-table__header-wrapper th) {
  background-color: #a1d5f8; /* 自定义背景色 */
}
:deep(.el-table__header th) {
  color: #fff; /* 自定义字体颜色 */
}
:deep(.myTabs .el-tabs__item.is-active) {
  background-color: #409eff; /* 激活标签的背景色 */
  color: #fff; /* 激活标签的字体颜色 */
}
.workboard {
  display: flex;
  justify-content: space-between;
  background-color: #fff;
  // height: 350px;
  margin: 5px 0;
  .myundo,
  .mydone {
    position: relative;
    height: 280px;
    .pagination {
      position: absolute;
      margin: 5px 02;
      right: 0;
      bottom: 5px;
    }
  }
  .detail {
    padding: 40px 30px;
    .datetime {
      width: 100%;
      background-color: #409eff;
      height: 60px;
      line-height: 60px;
      text-align: center;
      color: #fff;
      font-size: 28px;
      font-weight: 550;
    }
    .doTotal {
      margin: 5px 0;
      display: flex;
      justify-content: space-between;
      .undo,
      .hasdo {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;
        width: 48%;
        height: 150px;
        background-color: #409eff;
        font-size: 18px;
        font-weight: 550;
        color: #fff;
      }
    }
  }
}
.statistics {
  .title {
    height: 50px;
    line-height: 50px;
    font-size: 25px;
    text-align: center;
    color: #fff;
    background-color: #409eff;
  }
  .dashboard {
    padding: 20px 0;
    background-color: #fff;
    .product {
      display: flex;
      justify-content: space-between;
      .product-detail {
        padding: 40px 20px 40px 0;
      }
    }
  }
}
</style>
