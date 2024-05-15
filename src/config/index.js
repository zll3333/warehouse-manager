/**
 * 环境配置封装
 */

// 获取当前环境
const env = import.meta.env.MODE || 'prod' || 'test'
// 环境配置
const EnvConfig = {
  development: {
    // 开发环境
    baseApi: '/api',
    mockApi: 'https://www.fastmock.site/mock/be039def071dd621fc98189517d1f72e/api'
  },
  test: {
    // 测试环境
    baseApi: '/',
    mockApi: 'https://www.fastmock.site/mock/be039def071dd621fc98189517d1f72e/api'
  },
  prod: {
    // 生产环境
    baseApi: '/',
    mockApi: 'https://www.fastmock.site/mock/be039def071dd621fc98189517d1f72e/api'
  }
}
export default {
  env,
  mock: false,
  namespace: 'warehouse_management',
  ...EnvConfig[env]
}