/**
 * storage二次封装   开辟一个命名空间 让该系统的所有storage以对象存储在同一个key（config.namespace)中
 */
import config from '../config'
export default {
  setItem (key, value) {
    let storage = this.getStorage()
    storage[key] = value
    window.localStorage.setItem(config.namespace, JSON.stringify(storage))
  },
  getItem (key) {
    return this.getStorage()[key]
  },
  clearItem (key) {
    let storage = this.getStorage
    delete storage[key]
  },
  clearAll () {
    window.localStorage.clear()
  },
  getStorage () {
    return JSON.parse(window.localStorage.getItem(config.namespace) || '{}')
  }
}

