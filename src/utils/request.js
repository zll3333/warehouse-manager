/**
 * axios二次封装
 */
import axios from 'axios';
import config from '../config';
import { ElMessage } from 'element-plus';
import router from '../router';
import storage from '../utils/storage'

const TOKEN_INVALID = 'Token认证失败，请重新登录'
const NETWORK_ERROR = '网络请求异常，请稍后重试'

const instance = axios.create({
  baseURL: config.baseApi,
  timeout: 8000
})

// 请求拦截器
instance.interceptors.request.use((req) => {
  // 在请求头headers动态添加Authorization
  const headers = req.headers
  const token = storage.getItem('token')
  if (!headers.Authorization) {
    headers.Authorization = 'Bearer ' + token
  } else {
    router.login('/login')
  }
  return req
})

//响应拦截器
instance.interceptors.response.use((res) => {
  const { code, data, msg } = res.data
  if (code === 200) {
    // 成功
    return data
  } else if (code === 50001) {
    // 登录过期（失效）
    ElMessage.error(TOKEN_INVALID)
    storage.clearItem('userInfo')
    // 跳转到登录页
    setTimeout(() => {
      router.push('/login')
    }, 500)
    // 控制台抛出异常
    return Promise.reject(TOKEN_INVALID)
  } else {
    // 非登录错误 其他错误
    ElMessage.error(msg || NETWORK_ERROR)

    // 控制台抛出异常
    return Promise.reject(TOKEN_INVALID)
  }
})

/**
 * 请求核心函数
 * @param {*} options 
 */
function request (options) {
  options.method = options.method || 'get'
  if (options.method.toLowerCase() === 'get') {
    options.params = options.data
  }
  // 如果是生产环境
  if (config.env === 'prod') {
    instance.defaults.baseURL = config.baseApi
  } else {
    instance.defaults.baseURL = config.mock ? config.mockApi : config.baseApi
  }
  return instance(options)
}

['get', 'post', 'put', 'delete', 'patch'].forEach((item) => {
  request[item] = (url, data, options) => {
    return request({
      method: item,
      url,
      data,
      ...options
    })
  }
})

export default request
