<script setup>
import { getCurrentInstance, onMounted, reactive } from 'vue';
import * as echarts from 'echarts'
const { proxy } = getCurrentInstance()

const stackData = reactive({})

const getStackData = async () => {
  try {
    const res = await proxy.$api.getStackData()
    const stackAlert = await proxy.$api.getAlertList()

    Object.assign(stackData, { ...res, stackAlertNum: stackAlert.length })
  } catch (error) {
    throw new Error(error)
  }
}
// 统计各物资库存信息柱状图
const initStackBarChart = async () => {
  const barChart = echarts.init(proxy.$refs.stackBarChart)
  const res = await proxy.$api.getStack()
  // console.log(res);
  let xData = Object.keys(res)
  let yData = []
  for (let key in res) {
    yData.push(res[key])
  }
  const option = {
    title: {
      text: '物资库存数量统计',
      left: 'center'
    },
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: {
        interval: 0,
        rotate: -45
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: yData,
        type: 'bar'
      }
    ]
  }
  barChart.setOption(option)
}

// 物资库存预警统计
const initAlertStackBarChart = async () => {
  const barChart = echarts.init(proxy.$refs.alertBarChart)
  const alertList = await proxy.$api.getAlertList()
  console.log(alertList);
  const xAxis = alertList.map(item => item.materialName)
  const safeStack = alertList.map(item => item.safeStack)
  const stackNum = alertList.map(item => item.stackNum)
  const option = {
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
      top: 25,
      // itemStyle: {
      //   color
      // }
    },
    xAxis: {
      type: 'category',
      data: xAxis,
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '安全库存量',
        type: 'bar',
        data: safeStack,
        // itemStyle: {
        //   color: '#91CC75'
        // }

      },
      {
        name: '当前库存',
        type: 'bar',
        data: stackNum,
        itemStyle: {
          color: '#B22222'
        }

      }
    ]
  }
  barChart.setOption(option)
}
onMounted(() => {
  getStackData()
  initStackBarChart()
  initAlertStackBarChart()
})
</script>
<template>
  <div class="inventory-manage">
    <div class="title">库存报表数据可视化看板</div>
    <div class="dashboard">
      <div>
        <ul class="ckInfo">
          <li class="item">
            <span>仓库总数</span>
            <span>{{ stackData.warehouseNum }}</span>
          </li>
          <li class="item">
            <span>物资总数</span>
            <span>{{ stackData.materialNum }}</span>
          </li>
          <li class="item">
            <span>库存总数</span>
            <span>{{ stackData.stackNum }}</span>
          </li>
          <li class="item">
            <span>物资库存不足数</span>
            <span>{{ stackData.stackAlertNum }}</span>
          </li>
        </ul>
      </div>
      <div class="barCharts">
        <div
          class="stackBarChart"
          ref="stackBarChart"
        ></div>
        <div
          class="alertBarChart"
          ref="alertBarChart"
        ></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.inventory-manage {
  .title {
    height: 50px;
    line-height: 50px;
    font-size: 25px;
    text-align: center;
    color: #fff;
    background-color: #409eff;
  }
  .dashboard {
    margin-top: 10px;
    // background-color: #fff;
    .ckInfo {
      display: flex;
      // width: 35%;
      background-color: #fff;
      justify-content: space-around;
      // align-items:;
      flex-wrap: wrap;
      padding: 0 30px;
      .item {
        width: 23%;
        height: 100px;
        margin: 10px 0;
        border-radius: 5px;
        background-color: #084787;
        font-size: 20px;
        color: #fff;
        font-weight: 500;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
      }
    }
    .barCharts {
      display: flex;
      justify-content: space-between;
      .stackBarChart,
      .alertBarChart {
        width: 49%;
        height: 300px;
        background-color: #fff;
        margin-top: 10px;
        padding-top: 15px;
      }
    }
  }
}
</style>