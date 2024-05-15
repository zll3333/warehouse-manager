import { createRouter, createWebHashHistory } from 'vue-router';
import Layout from '../layout/index.vue'
const routes = [
  {
    name: 'layout',
    path: '/',
    meta: {
      title: '首页'
    },
    component: Layout,
    redirect: '/login',
    children: [
      {
        name: 'home',
        path: '/home',
        meta: {
          title: '首页'
        },
        component: () => import("../views/Home.vue")
      },
      {
        name: 'user',
        path: '/user',
        meta: {
          title: '用户管理'
        },
        component: () => import("../views/User.vue")
      }, {
        name: 'role',
        path: '/role',
        meta: {
          title: '角色管理'
        },
        component: () => import("../views/Role.vue")
      }, {
        name: 'dept',
        path: '/dept',
        meta: {
          title: '部门管理'
        },
        component: () => import("../views/Dept.vue")
      },
      {
        name: 'menu',
        path: '/menu',
        meta: {
          title: '菜单管理'
        },
        component: () => import("../views/Menu.vue")
      },
      {
        name: 'material',
        path: '/material',
        meta: {
          title: '物资管理'
        },
        component: () => import("../views/Material.vue")
      },
      {
        name: 'vendor',
        path: '/vendor',
        meta: {
          title: '供应商管理'
        },
        component: () => import('../views/Vendor.vue')
      },
      {
        name: 'warehouse',
        path: '/warehouse',
        meta: {
          title: '仓库管理'
        },
        component: () => import('../views/Warehouse.vue')
      },
      {
        name: 'inboundReq',
        path: '/inboundReq',
        meta: {
          title: '入库申请'
        },
        component: () => import('../views/InboundReq.vue')
      },
      {
        name: 'inboundApprove',
        path: '/inboundApprove',
        meta: {
          title: '入库审批',
        },
        component: () => import('../views/InboundApprove.vue')
      },
      {
        name: 'inboundRecord',
        path: '/inboundRecord',
        meta: {
          title: '入库记录'
        },
        component: () => import('../views/InboundRecord.vue')
      },
      {
        name: 'outboundReq',
        path: '/outboundReq',
        meta: {
          title: '出库申请'
        },
        component: () => import('../views/OutboundReq.vue')
      },
      {
        name: 'outboundApprove',
        path: '/outboundApprove',
        meta: {
          title: '出库审批'
        },
        component: () => import('../views/OutboundApprove.vue')
      },
      {
        name: 'outboundRecord',
        path: '/outboundRecord',
        meta: {
          title: '出库记录'
        },
        component: () => import('../views/OutboundRecord.vue')
      },
      {
        name: 'stackInfo',
        path: '/stackInfo',
        meta: {
          title: '库存信息',

        },
        component: () => import('../views/StackInfo.vue')
      },
      {
        name: 'stackAlert',
        path: '/stackAlert',
        meta: {
          title: '库存预警'
        },
        component: () => import('../views/StackAlert.vue')
      },
      {
        name: 'inventoryReports',
        path: '/inventory',
        meta: {
          title: '库存报表'
        },
        component: () => import('../views/InventoryReport.vue')
      },
      {
        name: 'boundReports',
        path: 'boundReport',
        meta: {
          title: '出入库报表'
        },
        component: () => import("../views/BoundReport.vue")
      }

    ]
  },
  {
    name: 'login',
    path: '/login',
    component: () => import("../views/Login.vue")
  },
  {
    name: '404',
    path: '/404',
    component: () => import("../views/404.vue")
  }

]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
function checkPermission (path) {
  let hasPermission = router.getRoutes().filter(route => route.path === path).length
  if (hasPermission) {
    return true
  } else {
    return false
  }
}
//导航守卫
router.beforeEach((to, from, next) => {
  if (checkPermission(to.path)) {
    if (to.path === '/login') {
      document.title = '登录'
    } else {
      document.title = to.meta.title
    }
    next()
  } else {
    next('/404')
  }
})
export default router