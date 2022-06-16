<script setup lang="ts">
import {
  UserOutlined,
  PoweroffOutlined,
  UsergroupAddOutlined,
  MailOutlined,
  SmileTwoTone,
  ManOutlined,
  WomanOutlined,
  LoadingOutlined
} from "@ant-design/icons-vue";
import {ref, shallowRef, watch, watchEffect, h, onUnmounted} from "vue";
import FriendList from "./FriendList.vue";
import UserApi from "../apis/UserApi";
import {useUserStore} from "../store/UserStore";
import TokenUtil from "../utils/TokenUtil";
import {useRoute, useRouter} from "vue-router";
import SearchFriend from "./SearchFriend.vue";
import MessageNotification from "./MessageNotification.vue";
import {registerSocketEvents, removeSocketEvent} from "../socket/ChatSocket";
import {ChatMessage} from "../apis/MessageApi";
import FriendApi from "../apis/FriendApi";

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// 菜单点击事件(跳转组件)
// 默认值第一个
const menuIndex = ref([1])
const subMenu = shallowRef({})
const subMenuName = ref('')
const loggingOut = ref(false)
const indicator = h(LoadingOutlined, {
  style: {
    fontSize: '24px',
  },
  spin: true,
});
const isANotificationMessage = ref(false)
watchEffect(
    async () => {
      switch (menuIndex.value[0]) {
        case 1: {
          subMenu.value = FriendList
          subMenuName.value = '好友聊天'
        }
          break
        case 2: {
          subMenu.value = MessageNotification
          subMenuName.value = '消息通知'
          isANotificationMessage.value = false
        }
          break
        case 3: {
          subMenu.value = SearchFriend
          subMenuName.value = '添加好友'
        }
          break
        case 4: {
          loggingOut.value = true
          UserApi.logout().then(resp => {
            const data = resp.data
            if (data.code === 200) {
              // 删除用户数据
              userStore.$reset()
              // 删除Token
              TokenUtil.delToken()
              // 跳转登录界面
              router.replace({
                name: 'Login'
              }).then(() => {
                loggingOut.value = false
              })
            }
          })
        }
      }
    }
)
// 判断是否打开聊天窗口
const isOpen = ref(route.name != 'MainFace')
watch(
    () => route.name,
    (val) => {
      isOpen.value = val != 'MainFace'
    }
)
// 用户信息
const user = userStore.$state.user
// 是否有通知消息
const callback = (ev: WebSocketEventMap['message']) => {
  let m = JSON.parse(ev.data) as ChatMessage;
  if (m.type === 'ADD_FRIEND' && menuIndex.value[0] != 2) {
    isANotificationMessage.value = true
  }
}
FriendApi.loadAddFriend().then(resp => {
  let data = resp.data;
  if (data.code === 200) {
    for (let datum of data.data) {
      if (datum.status === 'PENDING') {
        isANotificationMessage.value = true
        break
      }
    }
  }
})
registerSocketEvents(callback)
onUnmounted(() => {
  removeSocketEvent(callback)
})
</script>

<script lang="ts">
export default {
  name: "MainFace"
}
</script>

<template>
  <a-layout class="window">
    <teleport to="#app">
      <div v-if="loggingOut"
           style="width: 100%;height: 100%;display: flex;position: absolute;top: 0; left: 0; background-color: rgba(245,245,245,0.6);">
        <a-spin :indicator="indicator" style="margin: auto"></a-spin>
      </div>
    </teleport>
    <a-layout-sider
        :style="{ overflow: 'hidden', height: '100vh'}"
        :collapsed-width="300"
        theme="light"
        default-collapsed
    >
      <a-row>
        <a-col :span="24">
          <a-page-header
              :title="user.name"
              class="site-page-header"
              :avatar="{ src: 'https://avatars1.githubusercontent.com/u/8186664?s=460&v=4' }"
          >
            <template #tags>
              <a-tag v-if="user.sex === '男'" color="success">
                <man-outlined/>
              </a-tag>
              <a-tag v-else color="error">
                <woman-outlined/>
              </a-tag>
            </template>
          </a-page-header>
          <a-divider style="margin: 0">
            <smile-two-tone/>
          </a-divider>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="6">
          <a-menu
              :inline-collapsed="false"
              mode="inline"
              :inline-indent="16"
              v-model:selectedKeys="menuIndex"
          >
            <a-menu-item :key="1">
              <template #icon>
                <UserOutlined/>
              </template>
            </a-menu-item>
            <a-menu-item :key="2">
              <template #icon>
                <a-badge :dot="isANotificationMessage" :offset="[5, 10]">
                  <mail-outlined/>
                </a-badge>
              </template>
            </a-menu-item>
            <a-menu-item :key="3">
              <template #icon>
                <usergroup-add-outlined/>
              </template>
            </a-menu-item>
            <a-menu-item :key="4">
              <template #icon>
                <poweroff-outlined/>
              </template>
            </a-menu-item>
          </a-menu>
        </a-col>
        <a-col :span="18">
          <header style="text-align: center; padding: 10px 0;">
            <a-tag color="#55acee">
              <span>{{ subMenuName }}</span>
            </a-tag>
          </header>
          <a-divider style="margin: 0"/>
          <transition mode="out-in" leave-active-class="fade-out-down">
            <component :is="subMenu"></component>
          </transition>
        </a-col>
      </a-row>
    </a-layout-sider>
    <a-layout-content class="chat-empty" v-if="!isOpen">
      <a-empty :description="null" :locale="{emptyText: '暂无好友'}"/>
    </a-layout-content>
    <router-view></router-view>
  </a-layout>
</template>
<style scoped lang="scss">
.window {
  width: 100vw;
  height: 100vh;
  overflow-y: hidden;
  overflow-x: auto;
}

.chat-empty {
  display: flex;

  :deep(.ant-empty) {
    margin: auto;
  }
}

.fade-out-down {
  animation-name: fadeOutDown;
  animation-duration: 250ms;
}
</style>