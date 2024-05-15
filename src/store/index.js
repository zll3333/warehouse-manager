import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import storage from '../utils/storage';

export const useUserStore = defineStore("user", () => {
  const userInfo = reactive(storage.getItem("userInfo") || {})
  const menuList = ref(storage.getItem("menuList") || [])
  const actionList = ref(storage.getItem("actionList") || [])
  function saveUserInfo (res) {
    storage.setItem("userInfo", res)
    let info = storage.getItem("userInfo")
    Object.assign(userInfo, info)
  }
  function saveMenuList (res) {
    storage.setItem("menuList", res)
    let list = storage.getItem("menuList")
    Object.assign(menuList, list)
  }
  function saveActionList (res) {
    storage.setItem("actionList", res)
    let list = storage.getItem("actionList")
    Object.assign(actionList, list)
  }
  return { userInfo, menuList, actionList, saveUserInfo, saveMenuList, saveActionList }
})