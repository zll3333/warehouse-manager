<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getCurrentInstance } from 'vue';
import { User, Hide } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus';
import { useUserStore } from '../store';

const { proxy } = getCurrentInstance()
const router = useRouter()
const userStore = useUserStore()
const ruleFormRef = ref()

// 定义用户登录数据
const user = reactive({
  userName: '',
  userPwd: ''
})
// 校验规则
const rules = reactive({
  userName: {
    required: true,
    message: '请输入账号',
    trigger: 'blur'
  },
  userPwd: {
    required: true,
    message: '请输入密码',
    trigger: 'blur'
  }
})

// 登录
function login (form) {
  if (!form) return
  form.validate(async (valid) => {
    if (valid) {
      await proxy.$api.login(user).then((res) => {
        userStore.saveUserInfo(res)
        // proxy.$storage.setItem("userInfo", res)
        proxy.$storage.setItem("token", res.token)
        ElMessage.success('登陆成功')
        router.push('/home')
      })
    } else {
      return false
    }
  })
}



onMounted(() => {
  // proxy.$request.get('/login', { name: 'jack' })
  // console.log(userStore);
})
</script>
<template>
  <div class="login-wrapper">
    <div class="modal">
      <el-form
        :model="user"
        :rules="rules"
        ref="ruleFormRef"
      >
        <div class="title">火电厂仓储管理系统</div>
        <el-form-item prop="userName">
          <el-input
            type="text"
            placeholder="请输入账号"
            :prefix-icon="User"
            v-model="user.userName"
          />
        </el-form-item>
        <el-form-item prop="userPwd">
          <el-input
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Hide"
            v-model="user.userPwd"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="btn-login"
            @click="login(ruleFormRef)"
          >登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss">
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f9fcff;
  width: 100vw;
  height: 100vh;
  .modal {
    width: 500px;
    padding: 50px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0px 0px 10px 3px #c7c9cb4d;
    .title {
      font-size: 30px;
      line-height: 1.5;
      text-align: center;
      margin-bottom: 30px;
    }
    .btn-login {
      width: 100%;
    }
  }
}
</style>