<script setup>
import * as echarts from 'echarts';
import { getCurrentInstance, onMounted, reactive, ref } from 'vue';
const { proxy } = getCurrentInstance()

const data = ref([])
const columns = [
  {
    label: '总入库次数',
    prop: 'inboundNum',
  },
  {
    label: '总出库次数',
    prop: 'outboundNum',
  },
  {
    label: '日均入库次数',
    prop: 'inboundAvg',
    formatter (row, column, value) {
      return value.toFixed(2)
    },
    // width: 140
  },
  {
    label: '日均出库次数',
    prop: 'outboundAvg',
    // width: 150,
    formatter (row, column, value) {
      return value.toFixed(2)
    },
  }
]
const getData = async () => {
  try {
    const list = await proxy.$api.getData()
    data.value = list
  } catch (error) {
    throw new Error(error)
  }
}
// 获取入库操作柱状图数据
const getInboudBarData = async () => {
  try {
    const res = await proxy.$api.getInboundBarData()
    return res
  } catch (err) {
    throw new Error(err)
  }
}
const getInboundPieData = async () => {
  try {
    const res = await proxy.$api.getInboundPieData()
    return res
  } catch (err) {
    throw new Error(err)
  }
}
const getOutboundPieData = async () => {
  try {
    const res = await proxy.$api.getOutboundPieData()
    return res
  } catch (err) {
    throw new Error(err)
  }
}
const initBarChart = async () => {
  const res = await getInboudBarData()

  let barChart = echarts.init(proxy.$refs.barChartRef);
  const barOption = {
    title: {
      text: '仓库出入库操作统计情况',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      right: 20,
      top: 25
    },
    xAxis: {
      type: 'category',
      data: res.xAxis,
      name: '仓库'
    },
    yAxis: {
      type: 'value',
      name: '操作次数'
    },
    series: [
      {
        name: '入库',
        type: 'bar',
        data: res.inRecord,

      },
      {
        name: '出库',
        type: 'bar',
        data: res.outRecord,

      }
    ]
  }


  barChart.setOption(barOption)

}
const initInboundPie = async () => {
  const inboundPieChart = echarts.init(proxy.$refs.inboundPie)
  const data = await getInboundPieData()
  const pieOption = {
    title: {
      text: '入库操作占比统计情况',
      left: 'center',
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      // top: '10%',
      top: 20,
      left: 20,
      orient: 'vertical'
    },
    series: [
      {
        type: 'pie',
        data,
        radius: ['40%', '70%'],
        labelLine: {
          show: false
        },
        label: {
          show: false,
          position: 'center'
        },
        avoidLabelOverlap: false,
      }
    ]
  }
  inboundPieChart.setOption(pieOption)
}
const initOutboundPie = async () => {
  const outboundPieChart = echarts.init(proxy.$refs.outboundPie)
  const data = await getOutboundPieData()
  const pieOption = {
    title: {
      text: '出库操作占比统计情况',
      left: 'center',
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: 20,
      left: 20,
      orient: 'vertical'
    },
    series: [
      {
        type: 'pie',
        data,
        radius: ['40%', '70%'],
        labelLine: {
          show: false
        },
        label: {
          show: false,
          position: 'center'
        },
        avoidLabelOverlap: false,
      }
    ]
  }
  outboundPieChart.setOption(pieOption)
}

// const getMaterialBound = async () => {
//   try {
//     let res = await proxy.$api.getMaterialBoundNum()
//     console.log(res);
//   } catch (error) {

//   }
// }
// 获取物资出入库数量柱状图数据
const initMaterialBarChart = async () => {
  let { inbound, outbound } = await proxy.$api.getMaterialBoundNum()
  const keys = Object.keys(inbound)
  const inboundNum = []
  const outboundNum = []
  for (let key in inbound) {
    inboundNum.push(inbound[key])
  }
  for (let key in outbound) {
    outboundNum.push(outbound[key])
  }
  let barChart = echarts.init(proxy.$refs.materialBarChart);
  const barOption = {
    title: {
      text: '各物资出入库数量统计情况',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      right: 20,
      top: 25
    },
    xAxis: {
      type: 'category',
      data: keys,
      name: '物资名称'
    },
    yAxis: {
      type: 'value',
      name: '数量'
    },
    series: [
      {
        name: '入库',
        type: 'bar',
        data: inboundNum,

      },
      {
        name: '出库',
        type: 'bar',
        data: outboundNum,

      }
    ]
  }


  barChart.setOption(barOption)
}
onMounted(() => {
  getData()
  initBarChart()
  initInboundPie()
  initOutboundPie()
  initMaterialBarChart()
})
</script>
<template>
  <div class="inbound-report">
    <div class="title">出入库报表数据可视化看板</div>
    <div class="dashbord">
      <div
        class="data-left"
        style="width:50%"
      >
        <div class="table">
          <el-table
            :data="data"
            row-key="_id"
            header-row-class-name="tabel-header"
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
        <div
          ref="barChartRef"
          class="barChart"
        ></div>
      </div>
      <div
        class="right-data"
        style="width:50%"
      >
        <div
          ref="inboundPie"
          class="inboundPie"
        ></div>
        <div
          ref="outboundPie"
          class="outboundPie"
        ></div>
      </div>

    </div>
    <div
      class="materialBarChart"
      ref="materialBarChart"
      style="width:100%;height:300px"
    >
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
.inbound-report {
  .dashbord {
    display: flex;
    justify-content: space-between;
  }
  .table {
    margin: 5px 0;
  }
  .title {
    height: 50px;
    line-height: 50px;
    font-size: 25px;
    text-align: center;
    color: #fff;
    background-color: #409eff;
  }
  .barChart {
    padding-top: 10px;
    width: 100%;
    height: 300px;
    background-color: #fff;
  }
  .inboundPie,
  .outboundPie {
    padding: 10px 0;
    width: calc(100% - 5px);
    height: 200px;
    margin: 5px;
    background-color: #fff;
  }
  .materialBarChart {
    background-color: #fff;
    padding-top: 20px;
  }
}
</style>