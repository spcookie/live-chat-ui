<script setup lang="ts">

import {onUnmounted, ref} from "vue";
import FriendApi, {Friend} from "../apis/FriendApi";
import {useRoute, useRouter} from "vue-router";
import {registerSocketEvents, removeSocketEvent} from "../socket/ChatSocket";
import {useMessageStore} from "../store/MessageStore";
import {storeToRefs} from "pinia";
import {ManOutlined, WomanOutlined} from "@ant-design/icons-vue";

const router = useRouter()
const route = useRoute()

const messageStore = useMessageStore()

// 加载好友
const {friends} = storeToRefs(messageStore)
let friendList: Friend[]
const initLoading = ref(false)
const loadAllFriends = () => {
  initLoading.value = true
  FriendApi.loadFriends().then(resp => {
    friendList = resp.data.data
    friendList.forEach(value => {
      value.unread = 0
    })
    // 加载未读消息数量
    FriendApi.loadAllUnreadCount().then(resp => {
      const unreadCount: Record<string, number> = resp.data.data
      Object.entries(unreadCount).forEach(value => {
        for (let i = 0; i < friendList.length; i++) {
          let friend = friendList[i]
          if (friend.id.toString() === value[0]) {
            friend.unread = value[1]
            break
          }
        }
      })
      friends.value = friendList
    })
  }).finally(() => {
    initLoading.value = false
  })
}
loadAllFriends()
// 跳转聊天窗口
const chat = async (index: number, id: number, name: string) => {
  await router.push({
    name: 'Chat',
    params: {id, name}
  })
}
// 接收到消息时计算未读消息数
const callback = (ev: WebSocketEventMap['message']) => {
  const _message = JSON.parse(ev.data)
  if (_message.type === 'TEXT' || _message.type === 'IMAGE' || _message.type === 'FILE') {
    // 当前打开的好友窗口
    const {id} = route.params
    const fromId = _message.from.id
    if (id != fromId) {
      for (let e of friends.value) {
        if (e.id == fromId) {
          e.unread+= 1
          break
        }
      }
    }
  } else if (_message.type === 'ACCEPT_ADD_FRIEND') {
    // 添加好友成功后刷新好友列表
    loadAllFriends()
  }
}
registerSocketEvents(callback)
onUnmounted(() => {
  removeSocketEvent(callback)
})
</script>

<script lang="ts">
export default {
  name: "FriendList"
}
</script>

<template>
  <a-list
      item-layout="horizontal"
      :data-source="friends">
    <template #renderItem="{ item, index }">
      <a-list-item @click="chat(index, item.id, item.name)" class="friend-item">
        <a-skeleton avatar :title="false" :loading="initLoading" active>
          <a-list-item-meta>
            <template #description>
              <div class="friend-description">
                <a-tag v-if="item.sex === '男'" color="success">
                  <man-outlined />
                </a-tag>
                <a-tag v-else color="error">
                  <woman-outlined />
                </a-tag>
                <a-badge
                    :count=item.unread.toString()
                    :number-style="{
                  'min-width': '16px',
                  'height': '16px',
                  'margin-right': '16px',
                  'border-radius': '8px',
                  'line-height': '16px'
                }"
                />
              </div>
            </template>
            <template #title>
              <span>{{ item.name }}</span>
            </template>
            <template #avatar>
              <a-badge status="success">
                <a-avatar src="https://joeschmoe.io/api/v1/random"/>
              </a-badge>
            </template>
          </a-list-item-meta>
        </a-skeleton>
      </a-list-item>
    </template>
  </a-list>
</template>

<style scoped lang="scss">
.friend-description {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.friend-item {
  transition: all .25s;

  &:hover {
    background-color: #e6f7ff;
  }
}
:deep(.ant-list-items) {
  height: calc(100vh - 140.54px);
  overflow: auto;
}
</style>