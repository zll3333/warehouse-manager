<script setup>
import { onMounted, reactive, ref, toRaw, toRef } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store';
import BreadCrumb from '../components/BreadCrumb.vue';
import { getCurrentInstance } from 'vue';
import TreeMenu from '../components/TreeMenu.vue';
import {
  Bell, ArrowDown, Expand,
  Fold, Hide
} from '@element-plus/icons-vue';
import { storeToRefs } from 'pinia'
const { proxy } = getCurrentInstance()
const userStore = useUserStore()
const router = useRouter()
const isCollapse = ref(false)
const menuList = ref(userStore.menuList)
const actionList = ref(userStore.actionList)
const noticeCount = ref()
const showDialog = ref(false)
const action = ref()
function foldMenu () {
  isCollapse.value = !isCollapse.value
}
const userForm = reactive(userStore.userInfo)
// 退出登录
function handleCommand (command) {
  if (command === 'layout') {
    router.push('/login')
    proxy.$storage.clearItem("token")

  } else if (command === 'editPwd') {
    showDialog.value = true
    action.value = 'editPwd'
  } else if (command === 'userInfo') {
    showDialog.value = true
    action.value = 'userInfo'
    Object.assign(userForm, { userEmail: userForm.userEmail.split('@')[0] })
  }
}
const getMenuList = async () => {
  try {
    const list = await proxy.$api.getPermissionList()
    // menuList.value = list.menuList
    // actionList.value = list.actionList
    userStore.saveMenuList(list.menuList)
    userStore.saveActionList(list.actionList)
    // proxy.$storage.setItem("saveUserMenu", list.menuList)
    // proxy.$storage.setItem("saveUserAction", list.actionList)
  } catch (error) {
    console.error(error)
  }

  // console.log(menuList.value);
}
const getNoticeCount = async () => {
  try {
    const count = await proxy.$api.noticeCount()
    noticeCount.value = count
  } catch (error) {
    console.error(error)
  }
}
const handleSubmit = () => {
  proxy.$refs.userRef.validate(async (valid) => {
    if (valid) {
      if (action.value === 'editPwd') {
        try {
          const { userId, userPwd, oldPwd } = userForm
          await proxy.$api.updatePwd({ userId, userPwd, oldPwd })
          showDialog.value = false
          proxy.$message.success('密码修改成功')
        } catch (error) {
          proxy.$message.error('密码修改失败')
        }
      } else {
        try {
          let params = toRaw(userForm)
          params.userEmail += "@fire.com"
          params.action = 'edit'
          await proxy.$api.updateUser(params)
          showDialog.value = false
          proxy.$message.success('个人信息更新成功')
          proxy.$refs.userRef.resetFields()
          let res = await proxy.$api.getUserInfo({ userId: params.userId })
          userStore.saveUserInfo(res)
        } catch (err) {
          proxy.$message.error('修改失败')
          throw new Error(err)
        }
      }
    }
  })
}
const handleCancel = () => {
  showDialog.value = false
  proxy.$refs.userRef.resetFields()
}
const rules = {
  oldPwd: [
    {
      required: 'true',
      message: '请输入原密码',
      trigger: 'blur'
    }
  ],
  userPwd: [
    {
      required: 'true',
      message: '请输入新密码',
      trigger: 'blur'
    }
  ],
  userName: [
    {
      required: 'true',
      message: '请输入用户名',
      trigger: 'blur'
    }
  ],
  userEmail: [{
    required: 'true',
    message: '请输入邮箱',
    trigger: 'blur'
  }]

}
onMounted(() => {
  getMenuList()
})
</script>
<template>
  <div class="basic-layout">
    <div :class="['nav-side',isCollapse?'fold':'unfold']">
      <!-- 系统logo -->
      <div class="logo">
        <i class="logoicon iconfont icon-fire"></i>
        <span>仓储管理系统</span>
      </div>
      <!-- 导航菜单 -->
      <TreeMenu
        :isCollapse="isCollapse"
        :menuList="menuList"
      />
    </div>
    <div :class="
        ['content-right',isCollapse?'fold':'unfold']">
      <div class="nav-top">
        <div class="nav-left">
          <div
            class="menu-fold"
            @click="foldMenu"
          >
            <el-icon v-if="isCollapse">
              <Fold />
            </el-icon>
            <el-icon v-else>
              <Expand />
            </el-icon>
          </div>
          <BreadCrumb />
        </div>
        <div class="user-info">
          <el-badge
            :is-dot="noticeCount"
            class="notice"
          ><el-icon>
              <Bell />
            </el-icon>
          </el-badge>
          <el-dropdown @command="handleCommand">
            <span class="user-link">
              {{ userForm.userName }}
              <el-icon class="el-icon--right">
                <arrow-down />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="editPwd">修改密码</el-dropdown-item>
                <el-dropdown-item command="userInfo">个人信息</el-dropdown-item>
                <el-dropdown-item command="layout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <el-dialog
          v-model="showDialog"
          align-center
          :title="action==='editPwd'?'修改密码':'个人信息'"
          width="600"
        >
          <el-form
            :model="userForm"
            label-width="100"
            style="margin:30px 0"
            :rules="rules"
            ref="userRef"
          >
            <el-form-item
              label="用户名"
              prop="userName"
            >
              <el-input
                placeholder="请输入用户名"
                v-model="userForm.userName"
                :disabled="action==='editPwd'"
              />
            </el-form-item>
            <el-form-item
              label="原密码"
              prop="oldPwd"
              v-if="action==='editPwd'"
            >
              <el-input
                type="password"
                placeholder="请输入原密码"
                v-model="userForm.oldPwd"
                :prefix-icon="Hide"
              />
            </el-form-item>
            <el-form-item
              label="新密码"
              prop="userPwd"
              v-if="action==='editPwd'"
            >
              <el-input
                type="password"
                placeholder="请输入新密码"
                v-model="userForm.userPwd"
                :prefix-icon="Hide"
              />
            </el-form-item>
            <el-form-item
              label="用户邮箱"
              prop="userEmail"
              v-if="action==='userInfo'"
            >
              <el-input
                placeholder="请输入用户邮箱"
                v-model="userForm.userEmail"
              >
                <template #append>@fire.com</template></el-input>
            </el-form-item>
            <el-form-item
              label="手机号"
              prop="mobile"
              v-if="action==='userInfo'"
            >
              <el-input
                placeholder="请输入手机号"
                v-model="userForm.mobile"
              />
            </el-form-item>
            <el-form-item
              label="性别"
              prop="sex"
              v-if="action==='userInfo'"
            >
              <el-radio-group v-model="userForm.sex">
                <el-radio
                  label="男"
                  :value="0"
                ></el-radio>
                <el-radio
                  label="女"
                  :value="1"
                ></el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="handleCancel">取消</el-button>
              <el-button
                type="primary"
                @click="handleSubmit"
              >
                确定
              </el-button>
            </div>
          </template>
        </el-dialog>
      </div>
      <div class="wrapper">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
body {
  background-color: #eef0f3;
}
.basic-layout {
  position: relative;

  .nav-side {
    position: fixed;
    // width: 200px;
    height: 100vh;
    background-color: #001529;
    color: #fff;
    overflow-y: auto;
    white-space: nowrap;
    transition: width 0.5s;
    z-index: 999;
    &.fold {
      width: 64px;
    }
    &.unfold {
      width: 200px;
    }
    .logo {
      display: flex;
      padding-left: 25px;
      align-items: center;
      height: 50px;
      font-size: 18px;
      .logoicon {
        font-size: 30px;
        padding-right: 10px;
      }
    }
    .el-menu {
      border-right: none;
    }
  }
  .content-right {
    // margin-left: 200px;

    transition: width 0.5s;
    &.fold {
      margin-left: 64px;
    }
    &.unfold {
      margin-left: 200px;
    }
    .nav-top {
      // position: fixed;
      height: 50px;
      line-height: 50px;
      display: flex;
      justify-content: space-between;
      // padding: 0 20px;
      padding-right: 25px;
      background-color: #fff;
      .nav-left {
        display: flex;
        align-items: center;
        .menu-fold {
          width: 30px;
          height: 30px;
          line-height: 30px;
          text-align: center;
          font-size: 20px;
          margin-right: 15px;
          &:hover {
            background-color: #f1f1f1;
          }
        }
      }
      .user-info {
        display: flex;
        align-items: center;
        .notice {
          line-height: 20px;
          margin-right: 15px;
        }
        .user-link {
          cursor: pointer;
          height: 40px;
          line-height: 40px;
          width: 80px;
          text-align: center;
          &:hover {
            color: #409eff;
          }
          &:focus-visible {
            color: #409eff;
            outline: none;
          }
        }
      }
    }
    .wrapper {
      // height: calc(100% - 50px);
      background-color: #eef0f3;
      padding: 20px;
    }
  }
}
</style>