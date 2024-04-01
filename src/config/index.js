/**
 * 环境配置封装
 */

// 获取当前环境
const env = import.meta.env.MODE || 'prod'
// 环境配置
const EnvConfig = {
  dev: {
    // 开发环境
    baseApi: '/',
    mockApi: 'https://www.fastmock.site/mock/be039def071dd621fc98189517d1f72e/api'
  },
  test: {
    // 测试环境
    baseApi: '/',
    mockApi: 'https://www.fastmock.site/mock/be039def071dd621fc98189517d1f72e/api'
  },
  production: {
    // 生产环境
    baseApi: '/',
    mockApi: 'https://www.fastmock.site/mock/be039def071dd621fc98189517d1f72e/api'
  }
}
export default {
  env,
  mock: true,
  ...EnvConfig[env]
}