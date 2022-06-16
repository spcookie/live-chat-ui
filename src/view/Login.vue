<script setup lang="ts">
import {h, reactive, ref} from "vue";
import UserApi from "../apis/UserApi";
import {User, useUserStore} from "../store/UserStore";
import {useRouter} from "vue-router";
import {connectSocket} from "../socket/ChatSocket";
import {UserOutlined, KeyOutlined, LoadingOutlined, SmileOutlined} from "@ant-design/icons-vue";
import {message} from "ant-design-vue";
import {notification} from "ant-design-vue/es";

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
      const accountInfo = userInfo.account
      const user: User = {
        id: userInfo.id,
        username: userInfo.username,
        name: accountInfo.name,
        age: accountInfo.age,
        sex: accountInfo.sex,
        phone: accountInfo.phone,
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
      isMobile()
    } else {
      message.error('用户名或密码错误')
    }
  } finally {
    // 关闭
    isLogining.value = false
  }
}
// 检测是否是手机端
const isMobile = () => {
  let is = false
  // 当前设备是移动设备
  if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
    is = true
  } else if (/Android|iPhone|iPad|iPod/i.test(navigator.platform)) {
    is = true
  } else if (typeof window.orientation !== 'undefined') {
    is = true
  } else if ('ontouchstart' in document.documentElement) {
    is = true
  }
  if (is) {
    notification.open({
      message: '当前设备是移动设备',
      description: '为了更好的体验, 请横屏使用',
      icon: () => h(SmileOutlined, { style: 'color: #108ee9' }),
    })
  }
}

const isLogin = ref(true)
// 注册
const registerData = reactive({
  name: '',
  password: '',
  confirmPassword: '',
  phone: '',
  sex: '',
  age: ''
})
// 校验
const checkName = async (_rule: any, value: string) => {
  if (value === '') {
    return Promise.reject('请输入昵称');
  } else if (value.length > 10) {
    return Promise.reject('长度不能超过10')
  } else {
    return Promise.resolve()
  }
}
const checkPassword = (_rule: any, value: string) => {
  if (value === '') {
    return Promise.reject('请输入密码');
  } else if (8 > value.length || value.length > 16) {
    return Promise.reject('密码长度在8-16之间');
  } else {
    return Promise.resolve()
  }
}
const checkConfirmPassword = (_rule: any, value: string) => {
  if (value === '') {
    return Promise.reject('请再次输入密码');
  } else if (value != registerData.password) {
    return Promise.reject('两次输入的密码不同');
  } else {
    return Promise.resolve()
  }
}
const checkPhone = (_rule: any, value: string) => {
  if (value === '') {
    return Promise.reject('请输入电话号码');
  } else if (value.length != 11) {
    return Promise.reject('请输入规范的电话号码');
  } else {
    return Promise.resolve()
  }
}
const rules = {
  name: [{validator: checkName, trigger: 'blur'}],
  password: [{validator: checkPassword, trigger: 'blur'}],
  phone: [{validator: checkPhone, trigger: 'blur'}],
  confirmPassword: [{validator: checkConfirmPassword, trigger: 'blur'}]
}
// 开始注册账号
const accountNumber = ref('')
const registrationResultDisplay = ref(false)
const isRegistration = ref(false)
const registrationVerificationFinish = () => {
  const register = {
    password: registerData.password,
    account: {
      name: registerData.name,
      phone: registerData.phone,
      age: 20,
      sex: registerData.sex
    }
  }
  isRegistration.value = true
  UserApi.register(register).then(resp => {
    const {data} = resp
    if (data.code === 200) {
      accountNumber.value = data.data.username
      registrationResultDisplay.value = true
    } else if (data.code === 405) {
      message.warn("表单填写错误请检查")
    } else if (data.code === 500) {
      message.error(data.message)
    }
  }).finally(() => {
    isRegistration.value = false
  })
}
const toLogin = () => {
  registrationResultDisplay.value = false
  isLogin.value = true
}
</script>

<script lang="ts">
export default {
  name: "Login"
}
</script>

<template>
  <section class="login-container">
    <div v-if="!registrationResultDisplay" class="form-mask">
      <transition
          leave-active-class="toggle-animation-leave"
          enter-active-class="toggle-animation-enter"
          mode="out-in"
      >
        <a-card v-if="isLogin">
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
                  name="login"
                  :label-col="{ span: 6 }"
                  :wrapper-col="{ span: 16 }"
                  autocomplete="off"
                  @finish="finish"
              >
                <a-form-item
                    label="账号"
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
                <a-form-item :wrapper-col="{span: 24}">
                  <a-row justify="center" :gutter="6">
                    <a-col :span="12">
                      <a-button style="width: 100%;" type="primary" html-type="submit">
                        <template v-if="isLogining" #icon>
                          <loading-outlined/>
                        </template>
                        <span>登录</span>
                      </a-button>
                    </a-col>
                    <a-col :span="6">
                      <a-button style="width: 100%;" @click="isLogin = false"  type="dashed">注册</a-button>
                    </a-col>
                  </a-row>
                </a-form-item>
              </a-form>
            </template>
          </a-card-meta>
        </a-card>
        <a-card v-else>
          <a-form
              :model="registerData"
              name="register"
              @finish="registrationVerificationFinish"
              :rules="rules"
              hideRequiredMark
              :label-col="{ span: 6 }"
              :wrapper-col="{ span: 18 }"
              autocomplete="off"
          >
            <a-form-item
                has-feedback
                label="昵称"
                name="name"
            >
              <a-input v-model:value="registerData.name"></a-input>
            </a-form-item>
            <a-form-item
                has-feedback
                label="密码"
                name="password"
            >
              <a-input-password v-model:value="registerData.password"></a-input-password>
            </a-form-item>
            <a-form-item
                has-feedback
                label="确认密码"
                name="confirmPassword"
            >
              <a-input-password v-model:value="registerData.confirmPassword"></a-input-password>
            </a-form-item>
            <a-form-item
                has-feedback
                label="电话"
                name="phone"
            >
              <a-input type="number" v-model:value="registerData.phone"></a-input>
            </a-form-item>
            <a-form-item
                label="性别"
                name="sex"
                :rules="[{ required: true, message: '请选择性别' }]"
            >
            <a-radio-group v-model:value="registerData.sex">
              <a-radio-button value="男">男</a-radio-button>
              <a-radio-button value="女">女</a-radio-button>
            </a-radio-group>
            </a-form-item>
            <a-form-item
                label="生日"
                name="age"
                :rules="[{ required: true, message: '请输入生日' }]"
            >
              <a-date-picker v-model:value="registerData.age" />
            </a-form-item>
            <a-form-item :wrapper-col="{span: 24}">
              <a-row justify="center" :gutter="6">
                <a-col :span="12">
                  <a-button html-type="submit" style="width: 100%;" type="dashed">
                    <template v-if="isRegistration" #icon>
                      <loading-outlined/>
                    </template>
                    <span>注册</span>
                  </a-button>
                </a-col>
                <a-col :span="12">
                  <a-button @click="isLogin = true" style="width: 100%;" type="dashed">返回</a-button>
                </a-col>
              </a-row>
            </a-form-item>
            </a-form>
        </a-card>
      </transition>
    </div>
    <div v-else class="registration-result">
      <a-result
          status="success"
          title="注册成功"
      >
        <template #subTitle>
          <span>
            您的账号是
          </span>
          <span style="font-weight: 800;font-size: x-large;color: #52c41a">{{ accountNumber }}</span>
          <span>
            请妥善保管
          </span>
        </template>
        <template #extra>
          <a-button @click="toLogin" type="primary">去登陆</a-button>
        </template>
      </a-result>
    </div>
  </section>
</template>

<style scoped lang="scss">
.login-container {
  display: flex;
  width: 100vw;
  min-height: 100vh;
  background-color: #f5f5f5;

  .form-mask {
    margin: auto;
    width: 400px;
    overflow: hidden;
  }

  .registration-result {
    margin: auto;
  }
}
.toggle-animation-leave {
  animation-name: fadeOutLeft;
  animation-duration: 500ms;
}
.toggle-animation-enter {
  animation-name: fadeInRight;
  animation-duration: 500ms;
}
</style>