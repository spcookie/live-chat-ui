<script setup lang="ts">
import {ref} from "vue";
import UserApi from "../apis/UserApi";
import {User, useUserStore} from "../store/UserStore";
import {useRouter} from "vue-router";
import {connectSocket} from "../socket/ChatSocket";
import {UserOutlined, KeyOutlined, LoadingOutlined} from "@ant-design/icons-vue";
import {message} from "ant-design-vue";

const userStore = useUserStore()
const router = useRouter()

const model = ref({
  username: '',
  password: ''
})

const isLogining = ref(false)
const finish = async () => {
  // 开启登录动画
  isLogining.value = true
  try {
    const {data} = await UserApi.login(model.value)
    if (data.code === 200) {
      // 登录成功保存用户信息到store
      const userInfo = data.data.user
      const tokenInfo = data.data.token
      const user: User = {
        id: userInfo.id,
        username: userInfo.username,
        name: userInfo.name,
        age: userInfo.age,
        phone: userInfo.phone,
        auth: userInfo.auth,
        token: tokenInfo
      }
      userStore.setUser(user)
      // 建立websocket连接
      connectSocket()
      // 跳转页面
      await router.replace({
        name: 'MainFace'
      })
    } else {
      message.error('用户名或密码错误')
    }
  } finally {
    // 关闭
    isLogining.value = false
  }
}

</script>

<script lang="ts">
export default {
  name: "Login"
}
</script>

<template>
  <section class="login-container">
    <a-card class="login-form">
      <template #cover>
        <img
            alt="example"
            src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
        />
      </template>
      <a-card-meta>
        <template #title>
          <h1 style="text-align: center">Live-Chat</h1>
        </template>
        <template #description>
          <a-form
              hideRequiredMark
              scrollToFirstError
              :model="model"
              name="basic"
              :label-col="{ span: 6 }"
              :wrapper-col="{ span: 16 }"
              autocomplete="off"
              @finish="finish"
          >
            <a-form-item
                label="用户名"
                name="username"
                :rules="[{ required: true, message: '请输入用户名' }]"
            >
              <a-input v-model:value="model.username">
                <template #prefix>
                  <user-outlined/>
                </template>
              </a-input>
            </a-form-item>
            <a-form-item
                label="密码"
                name="password"
                :rules="[{ required: true, message: '请输入密码' }]"
            >
              <a-input-password v-model:value="model.password">
                <template #prefix>
                  <key-outlined/>
                </template>
              </a-input-password>
            </a-form-item>
            <a-form-item :wrapperCol="{offset:6, span:16}">
              <a-button style="width: 60%;" type="primary" html-type="submit">
                <template v-if="isLogining" #icon>
                  <loading-outlined/>
                </template>
                <span>登录</span>
              </a-button>
              <a-button style="width: 40%;" type="dashed">注册</a-button>
            </a-form-item>
          </a-form>
        </template>
      </a-card-meta>
    </a-card>
  </section>
</template>

<style scoped lang="scss">
.login-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: #f5f5f5;

  .login-form {
    margin: auto;
    width: 400px;
  }
}
</style>