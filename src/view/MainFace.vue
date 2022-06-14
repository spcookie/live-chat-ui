<script setup lang="ts">
import {UserOutlined, PoweroffOutlined, UsergroupAddOutlined, MailOutlined} from "@ant-design/icons-vue";
import {ref, shallowRef, watch, watchEffect} from "vue";
import FriendList from "./FriendList.vue";
import UserApi from "../apis/UserApi";
import {useUserStore} from "../store/UserStore";
import TokenUtil from "../utils/TokenUtil";
import {useRoute, useRouter} from "vue-router";
import SearchFriend from "./SearchFriend.vue";
import MessageNotification from "./MessageNotification.vue";

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// 菜单点击事件(跳转组件)
// 默认值第一个
const menuIndex = ref([1])
const subMenu = shallowRef({})
const subMenuName = ref('')
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
        }
          break
        case 3: {
          subMenu.value = SearchFriend
          subMenuName.value = '添加好友'
        }
          break
        case 4: {
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
</script>

<script lang="ts">
export default {
  name: "MainFace"
}
</script>

<template>
  <a-layout class="window">
    <a-layout-sider :collapsed-width="300" theme="light" default-collapsed>
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
                <mail-outlined/>
              </template>
            </a-menu-item>
            <a-menu-item :key="3">
              <template #icon>
                <usergroup-add-outlined />
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
          <header style="text-align: center; padding: 10px 0;border-bottom: rgba(0,0,0,0.2) 1px solid">
            <a-tag color="#55acee">
              <span>{{ subMenuName }}</span>
            </a-tag>
          </header>
          <component :is="subMenu"></component>
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
  overflow: auto;
}

.chat-empty {
  display: flex;

  :deep(.ant-empty) {
    margin: auto;
  }
}
</style>