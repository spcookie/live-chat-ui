<script setup lang="ts">
import FriendApi from "../apis/FriendApi";
import {onUnmounted, ref, watch} from "vue";
import {CheckOutlined, CloseOutlined} from "@ant-design/icons-vue";
import {message} from "ant-design-vue";
import {receiveMessages, removeSocketEvent} from "../socket/ChatSocket";
import {ChatMessage} from "../apis/MessageApi";

// 加载好友请求通知消息
const addFriendMessage = ref([])
const initLoading = ref(false)
const loadAddFriendMessage = () => {
  initLoading.value = true
  FriendApi.loadAddFriend().then(resp => {
    const data = resp.data
    if (data.code === 200) {
      addFriendMessage.value = data.data
    }
  }).finally(() => {
    initLoading.value = false
  })
}
loadAddFriendMessage()

// 处理好友请求
const acceptFriend = async (id: number, code: boolean) => {
  const resp = await FriendApi.handleAddFriendMessage(id, code)
  const {data} = resp
  if (data.code === 200) {
    message.info(data.message)
  } else {
    message.error(data.message)
  }
  loadAddFriendMessage()
}

const chatMessage = ref<ChatMessage>({} as ChatMessage)
const callback = receiveMessages(chatMessage)
onUnmounted(() => {
  removeSocketEvent(callback)
})
watch(
    () => chatMessage.value,
    (val: any) => {
      if (val.type === 'ADD_FRIEND') {
        loadAddFriendMessage()
      }
    }
)
</script>

<script lang="ts">
export default {
  name: "MessageNotification"
}
</script>

<template>
  <a-list size="small" :data-source="addFriendMessage">
    <template #renderItem="{ item }">
      <a-skeleton :title="false" :loading="initLoading" active>
        <a-list-item>
          <a-list-item-meta>
            <template #title>
              <template v-if="item.status === 'PENDING'">
                <a-typography-text strong>{{ item.from.name }}</a-typography-text>
                <a-typography-text type="secondary">请求加为好友</a-typography-text>
              </template>
              <template v-else>
                <template v-if="item.status === 'ACCEPT'">
                  <a-typography-text type="secondary">已接受</a-typography-text>
                </template>
                <template v-if="item.status === 'REJECT'">
                  <a-typography-text type="secondary">已拒绝</a-typography-text>
                </template>
                <a-typography-text strong>{{ item.from.name }}</a-typography-text>
                <a-typography-text type="secondary">的好友请求</a-typography-text>
              </template>
            </template>
            <template #description>
              <div class="message-processing-button">
                <template v-if="item.status === 'PENDING'">
                  <a-button shape="round" size="small" style="margin-right: 10px" @click="acceptFriend(item.id, true)">
                    <template #icon>
                      <check-outlined />
                    </template>
                  </a-button>
                  <a-button shape="round" size="small" @click="acceptFriend(item.id, false)">
                    <template #icon>
                      <close-outlined />
                    </template>
                  </a-button>
                </template>
              </div>
            </template>
          </a-list-item-meta>
        </a-list-item>
      </a-skeleton>
    </template>
  </a-list>
</template>

<style scoped lang="scss">
.message-processing-button {
  display: flex;
  justify-content: flex-end;
}
:deep(.ant-list-items) {
  height: calc(100vh - 140.54px);
  overflow: auto;
}
</style>